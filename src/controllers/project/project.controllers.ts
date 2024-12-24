import { Response } from 'express'
import { ObjectId } from 'mongoose'
import { Logger } from 'winston'

import { ApiError, ApiResponse } from '../../utils'

import { CustomRequest } from '../../types/shared/shared.types'
import { Project } from '../../types/projects/project.types'
import { PricingModel } from '../../types/auth/user.types'

import { MemberService, ProjectService, UserService } from '../../services'
import { InvitationStatus, MemberRole } from '../../types/projects/member.types'
import { MSG } from '../../constants'

class ProjectController {
  constructor(
    private userService: UserService,
    private projectService: ProjectService,
    private memberService: MemberService,
    private logger: Logger
  ) {}

  async createProject(req: CustomRequest<Project>, res: Response) {
    const userId = req.user?._id as string
    const project = req.body

    this.logger.info({
      msg: MSG.PROJECT.CREATE_PROJECT,
      data: { ...project, userId },
    })

    const allProjects = await this.projectService.getProjectList(userId)

    const user = await this.userService.getUserById(userId)
    if (!user) throw new ApiError(401, 'Unauthorized User')

    if (user.pricingModel === PricingModel.FREE && allProjects.length >= 1) {
      throw new ApiError(
        400,
        'You can only create one project. Please upgrade your plan.'
      )
    } else if (
      user.pricingModel === PricingModel.PREMIUM &&
      allProjects.length >= 10
    ) {
      throw new ApiError(
        400,
        'You can only create 10 project. Please upgrade your plan'
      )
    } else if (
      user.pricingModel === PricingModel.ENTERPRISE &&
      allProjects.length >= 25
    ) {
      throw new ApiError(
        400,
        'You can only create 25 project. Please contact support team'
      )
    }

    const newProject = await this.projectService.createProject({
      ...project,
      userId: userId as unknown as ObjectId,
    })

    await this.memberService.createMember({
      userId: userId as unknown as ObjectId,
      projectId: newProject._id as unknown as ObjectId,
      email: user.email,
      invitationStatus: InvitationStatus.ACCEPTED,
      role: MemberRole.OWNER,
    })

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { project: newProject },
          'Project created successfully'
        )
      )
  }

  async getProject(req: CustomRequest, res: Response) {
    const userId = req.user?._id as string
    const projectId = req.query.projectId as string

    this.logger.info({
      msg: MSG.PROJECT.GET_PROJECT,
      data: { userId, projectId },
    })

    const member = await this.memberService.getMemberByUserIdAndProjectId(
      userId,
      projectId
    )
    if (!member) throw new ApiError(400, 'Member not foune')

    if (member.invitationStatus !== InvitationStatus.ACCEPTED)
      throw new ApiError(400, 'You are not member of this project')

    const project = await this.memberService.getProject(
      member._id as unknown as string
    )

    return res
      .status(200)
      .json(new ApiResponse(200, { project }, 'Project featched successfully'))
  }

  async updateProject(req: CustomRequest<Project>, res: Response) {
    const userId = req.user?._id
    const project = req.body

    this.logger.info({
      msg: MSG.PROJECT.UPDATE_PROJECT,
      data: { ...project, userId },
    })

    const existedProject = await this.projectService.getProjectById(project._id)
    if (!existedProject) throw new ApiError(404, 'Project not found')

    if (existedProject.userId.toString() !== userId?.toString())
      throw new ApiError(403, 'You are not allowed to edit this project')

    const updatedProject = await this.projectService.updateProject(project)

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { project: updatedProject },
          'Project updated successfully'
        )
      )
  }

  async deleteProject(req: CustomRequest<{ _id: string }>, res: Response) {
    const userId = req.user?._id
    const { _id: projectId } = req.body

    this.logger.info({
      msg: MSG.PROJECT.UPDATE_PROJECT,
      data: { userId, projectId },
    })

    const existedProject = await this.projectService.getProjectById(projectId)
    if (!existedProject) throw new ApiError(404, 'Project not found')

    if (existedProject.isDeleted)
      throw new ApiError(400, 'Project already deleted')

    if (existedProject.userId.toString() !== userId?.toString())
      throw new ApiError(403, 'You are not allowed to delete this project')

    await this.projectService.deleteProject(projectId)

    return res
      .status(200)
      .json(new ApiResponse(200, { projectId }, 'Project deleted successfully'))
  }

  async getProjects(req: CustomRequest, res: Response) {
    const userId = req.user?._id as string

    this.logger.info({
      msg: MSG.PROJECT.GET_PROJECTS,
      data: { userId },
    })

    const projects = await this.memberService.getProjects(userId)
    return res
      .status(200)
      .json(new ApiResponse(200, { projects }, 'Projects fetched successfully'))
  }
}

export default ProjectController
