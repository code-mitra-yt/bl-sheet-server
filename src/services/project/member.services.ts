import mongoose, { PipelineStage } from 'mongoose'
import { MemberModelType } from '../../models'
import {
  InvitationStatus,
  Member,
  GetMemberQuery,
} from '../../types/projects/member.types'
import { getMongoosePaginationOptions } from '../../utils'

class MemberService {
  constructor(private memberModel: MemberModelType) {}

  async createMember(member: Member) {
    return this.memberModel.create(member)
  }

  async getMemberByUserIdAndProjectId(userId: string, projectId: string) {
    return this.memberModel.findOne({ userId, projectId })
  }

  async getProject(memberId: string) {
    const pipeline: PipelineStage[] = [
      { $match: { _id: new mongoose.Types.ObjectId(memberId) } },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: '$project' },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          projectId: '$project._id',
          memberId: '$_id',
          name: '$project.name',
          description: '$project.description',
          tags: '$project.tags',
          isDeleted: '$project.isDeleted',
          role: 1,
          owner: {
            fullName: '$user.fullName',
            email: '$user.email',
            avatar: '$user.avatar',
          },
        },
      },
    ]

    const result = await this.memberModel.aggregate(pipeline).exec()
    if (result.length > 0) return result[0]
    return null
  }

  async getProjects(userId: string) {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          invitationStatus: InvitationStatus.ACCEPTED,
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: '$project' },
      {
        $match: {
          'project.isDeleted': { $ne: true },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'project.userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          memberId: '$_id',
          projectId: '$project._id',
          name: '$project.name',
          description: '$project.description',
          tags: '$project.tags',
          isDeleted: '$project.isDeleted',
          role: 1,
          owner: {
            fullName: '$user.fullName',
            email: '$user.email',
            avatar: '$user.avatar',
          },
        },
      },
    ]

    const result = await this.memberModel.aggregate(pipeline).exec()
    return result
  }

  async getMembersByProjectId(projectId: string, query: GetMemberQuery) {
    const { limit, page, email, invitationStatus } = query
    const searchQuery = new RegExp(email, 'i')

    const pipeline: PipelineStage[] = [
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(projectId),
          email: { $regex: searchQuery },
          ...(invitationStatus && { invitationStatus }),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          email: 1,
          user: { fullName: 1, avatar: 1 },
          invitationStatus: 1,
          role: 1,
        },
      },
    ]

    const members = await this.memberModel.aggregatePaginate(
      this.memberModel.aggregate(pipeline),
      getMongoosePaginationOptions({
        page,
        limit,
        customLabels: {
          totalDocs: 'total',
          docs: 'members',
        },
      })
    )

    return members
  }

  async getProjectMemberCount(projectId: string) {
    const pipeline: PipelineStage[] = [
      { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
      { $count: 'count' },
    ]
    const res = await this.memberModel.aggregate(pipeline).exec()
    if (res.length > 0) return res[0].count
    return 0
  }

  async getMemberByEmailAndProjectId(email: string, projectId: string) {
    return this.memberModel.findOne({ email, projectId })
  }

  async getMemberById(memberId: string) {
    return this.memberModel.findById(memberId)
  }

  async updateMember(memberId: string, member: Partial<Member>) {
    return this.memberModel.findByIdAndUpdate(memberId, member, {
      new: true,
    })
  }
}

export default MemberService
