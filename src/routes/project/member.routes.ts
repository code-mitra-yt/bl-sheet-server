import express from 'express'

import { logger } from '../../logger'
import { MemberModel, MemberModelType } from '../../models'
import { asyncHandler } from '../../utils'
import { MemberService } from '../../services'
import { MemberController } from '../../controllers'
import { verifyJWT, validate } from '../../middlewares'
import { getMembersQueryValidator } from '../../validators/project/member.validators'

const memberRoutes = express.Router()

const memberService = new MemberService(
  MemberModel as unknown as MemberModelType
)
const memberController = new MemberController(memberService, logger)

memberRoutes.get(
  '/getMembers',
  verifyJWT,
  getMembersQueryValidator,
  validate,
  asyncHandler((req, res) => memberController.getMembers(req, res))
)

export default memberRoutes
