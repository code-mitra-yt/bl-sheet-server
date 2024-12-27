import { Response } from 'express'
import { Logger } from 'winston'

import { MSG, URLS } from '../../constants'
import { ApiError, ApiResponse } from '../../utils'
import {
  MailgenService,
  MemberService,
  NotificationService,
  ProjectService,
  TokenService,
  UserService,
} from '../../services'
import { CustomRequest } from '../../types/shared/shared.types'
import {
  InvitationStatus,
  GetMemberQuery,
  InviteMemberBody,
  ChangeInvitationStatusBody,
  RemoveMemberBody,
  MemberRole,
  UpdateMemberBody,
} from '../../types/projects/member.types'
import { ObjectId } from 'mongoose'
import { ENV } from '../../config'
import { PricingModel } from '../../types/auth/user.types'

class MemberController {
  constructor(
    private userService: UserService,
    private memberService: MemberService,
    private projectService: ProjectService,
    private tokenService: TokenService,
    private notificationService: NotificationService,
    private mailgenService: MailgenService,
    private logger: Logger
  ) {}

  async getMembers(req: CustomRequest, res: Response) {
    const userId = req.user?._id as string
    const query = req.query as unknown as GetMemberQuery

    this.logger.info({
      msg: MSG.MEMBER.GET_MEMBERS,
      data: { userId },
    })

    const project = this.projectService.getProjectById(query.projectId)
    if (!project) throw new ApiError(400, 'Project not found not found')

    const member = await this.memberService.getMemberByUserIdAndProjectId(
      userId,
      query.projectId
    )
    if (!member) throw new ApiError(404, 'Member not found')
    if (member.invitationStatus !== InvitationStatus.ACCEPTED)
      throw new ApiError(
        403,
        'You have not accepted the invitation of this project'
      )

    const members = await this.memberService.getMembersByProjectId(
      query.projectId,
      query
    )

    return res
      .status(200)
      .json(new ApiResponse(200, members, 'Members fetched successfully'))
  }

  async inviteMember(req: CustomRequest<InviteMemberBody>, res: Response) {
    const user = req.user
    const { email, projectId } = req.body

    const project = await this.projectService.getProjectById(projectId)
    if (!project) throw new ApiError(400, 'Project not found not found')

    let member = await this.memberService.getMemberByEmailAndProjectId(
      email,
      projectId
    )
    if (member && member.invitationStatus === InvitationStatus.ACCEPTED)
      throw new ApiError(
        400,
        `${email} this member is already a member of this project`
      )

    const count = await this.memberService.getProjectMemberCount(projectId)
    if (user?.pricingModel === PricingModel.FREE && count >= 5) {
      throw new ApiError(
        400,
        'You can only invite 5 member. Please upgrade your plan.'
      )
    } else if (user?.pricingModel === PricingModel.PREMIUM && count >= 30) {
      throw new ApiError(
        400,
        'You can only invite 30 members. Please upgrade your plan'
      )
    } else if (user?.pricingModel === PricingModel.ENTERPRISE && count >= 150) {
      throw new ApiError(
        400,
        'You can only invite 150 members. Please contact support team'
      )
    }

    if (email === user?.email)
      throw new ApiError(400, 'You are not allowed to invite yourself')

    if (!member) {
      member = await this.memberService.createMember({
        email,
        projectId: projectId as unknown as ObjectId,
      })
    }

    const inviteToken = await this.tokenService.signToken(
      { user: { email, projectId, memberId: member._id } },
      '7 days'
    )
    const invitationLink = `${ENV.FRONTEND_URL!}${
      URLS.memberInvitationUrl
    }?invitationToken=${inviteToken}&projectName=${
      project?.name
    }&email=${email}`

    const { emailHTML, emailText } = this.mailgenService.inviteMemberHTML({
      name: email,
      link: invitationLink,
      inviteSenderName: user?.fullName!,
      projectName: project.name,
    })
    await this.notificationService.send({
      to: email,
      subject: `Invitation from ${project.name}`,
      html: emailHTML,
      text: emailText,
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { memberId: member._id },
          'Member invited successfully'
        )
      )
  }

  async changeInvitationStatus(
    req: CustomRequest<ChangeInvitationStatusBody>,
    res: Response
  ) {
    const userId = req.user?._id
    const userEmail = req?.user?.email
    const { invitationStatus, invitationToken } = req.body

    const decodeMember = this.tokenService.verifyToken(invitationToken) as any
    if (!decodeMember) throw new ApiError(400, 'Invitation token is invalid')
    if ((decodeMember?.exp || 0) * 1000 <= Date.now())
      throw new ApiError(400, 'Invitation token is expired')

    if (decodeMember.user.email !== userEmail) {
      throw new ApiError(
        400,
        `You are not allowed ${invitationStatus} invitation`
      )
    }

    const member = await this.memberService.getMemberById(
      decodeMember.user?.memberId
    )
    if (!member) throw new ApiError(404, 'Member not found')
    if (member.invitationStatus === InvitationStatus.ACCEPTED) {
      throw new ApiError(
        400,
        'This user has already accepted the project invitation'
      )
    }

    await this.memberService.updateMember(member._id as unknown as string, {
      invitationStatus,
      email: decodeMember.user.email,
      projectId: member.projectId as unknown as ObjectId,
      userId: userId as unknown as ObjectId,
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { memberId: member._id, email: member.email, invitationStatus },
          'Update invitation status successfully'
        )
      )
  }

  async removeMember(req: CustomRequest<RemoveMemberBody>, res: Response) {
    const userId = req.user?._id as string
    const { memberId, projectId } = req.body

    this.logger.info({
      msg: MSG.MEMBER.REMOVE_MEMBER,
      data: { userId, memberId },
    })

    const member = await this.memberService.getMemberById(memberId)
    if (!member) throw new ApiError(404, 'Member not found')

    if (member.role === MemberRole.OWNER) {
      throw new ApiError(403, 'You can not remove the owner of the project')
    }

    const owner = await this.memberService.getMemberByUserIdAndProjectId(
      userId,
      projectId
    )
    if (!owner)
      throw new ApiError(
        403,
        'You have no permission to remove member the project'
      )
    if (owner.role !== MemberRole.OWNER)
      throw new ApiError(
        403,
        'Only the owner can remove a member from the project'
      )

    await this.memberService.removeMember(memberId)

    return res
      .status(200)
      .json(new ApiResponse(200, { memberId }, 'Member removed successfully'))
  }

  async updateMember(req: CustomRequest<UpdateMemberBody>, res: Response) {
    const user = req.user
    const { memberId, projectId, role } = req.body

    const member = await this.memberService.getMemberById(memberId)
    if (!member) throw new ApiError(404, 'Member not found')
    if (member.role === MemberRole.OWNER)
      throw new ApiError(403, 'You can not update the owner of the project')

    const owner = await this.memberService.getMemberByUserIdAndProjectId(
      user?._id as string,
      projectId
    )
    if (!owner)
      throw new ApiError(
        403,
        'You have no permission to remove member the project'
      )
    if (owner.role !== MemberRole.OWNER)
      throw new ApiError(
        403,
        'Only the owner can remove a member from the project'
      )

    await this.memberService.updateMember(memberId, { role })

    return res
      .status(200)
      .json(new ApiResponse(200, { memberId }, 'Member updated successfully'))
  }
}

export default MemberController
