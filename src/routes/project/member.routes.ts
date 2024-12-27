import express from 'express'

import { logger } from '../../logger'
import { asyncHandler } from '../../utils'
import { MemberController } from '../../controllers'
import { verifyJWT, validate } from '../../middlewares'
import {
  MailgenService,
  MemberService,
  NotificationService,
  ProjectService,
  TokenService,
  UserService,
} from '../../services'
import {
  MemberModel,
  MemberModelType,
  ProjectModel,
  UserModel,
} from '../../models'
import {
  changeInvitationStatusValidator,
  getMembersQueryValidator,
  inviteMemberValidator,
  removeMemberValidator,
} from '../../validators/project/member.validators'

const memberRoutes = express.Router()

const memberService = new MemberService(
  MemberModel as unknown as MemberModelType
)
const userService = new UserService(UserModel)
const projectService = new ProjectService(ProjectModel)
const tokenService = new TokenService()
const notificationService = new NotificationService()
const mailgenService = new MailgenService()
const memberController = new MemberController(
  userService,
  memberService,
  projectService,
  tokenService,
  notificationService,
  mailgenService,
  logger
)

memberRoutes.get(
  '/getMembers',
  verifyJWT,
  getMembersQueryValidator,
  validate,
  asyncHandler((req, res) => memberController.getMembers(req, res))
)

memberRoutes.post(
  '/inviteMember',
  verifyJWT,
  inviteMemberValidator,
  validate,
  asyncHandler((req, res) => memberController.inviteMember(req, res))
)

memberRoutes.patch(
  '/changeInvitationStatus',
  verifyJWT,
  changeInvitationStatusValidator,
  validate,
  asyncHandler((req, res) => memberController.changeInvitationStatus(req, res))
)

memberRoutes.delete(
  '/removeMember',
  verifyJWT,
  removeMemberValidator,
  validate,
  asyncHandler((req, res) => memberController.removeMember(req, res))
)

export default memberRoutes
