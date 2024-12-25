import { Response } from 'express'
import { Logger } from 'winston'

import { ApiError } from '../../utils'
import { MSG } from '../../constants'
import { MemberService } from '../../services'
import { CustomRequest } from '../../types/shared/shared.types'
import {
  InvitationStatus,
  GetMemberQuery,
} from '../../types/projects/member.types'

class MemberController {
  constructor(
    private memberService: MemberService,
    private logger: Logger
  ) {}

  async getMembers(req: CustomRequest, res: Response) {
    const userId = req.user?._id as string
    const query = req.query as unknown as GetMemberQuery

    this.logger.info({
      msg: MSG.MEMBER.GET_MEMBERS,
      data: { userId },
    })

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

    res.status(200).json(members)
  }
}

export default MemberController
