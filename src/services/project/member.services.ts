import mongoose, { PipelineStage } from 'mongoose'
import { MemberModel } from '../../models'
import { InvitationStatus, Member } from '../../types/projects/member.types'

class MemberService {
  constructor(private memberModel: typeof MemberModel) {}

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
}

export default MemberService
