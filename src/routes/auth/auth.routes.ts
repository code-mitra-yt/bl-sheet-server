import express from 'express'

import { logger } from '../../logger'
import { UserModel } from '../../models'
import { asyncHandler } from '../../utils'
import { validate } from '../../middlewares'
import { AuthController } from '../../controllers'
import {
  HashService,
  MailgenService,
  NotificationService,
  TokenService,
  UserService,
} from '../../services'
import {
  userLoginValidator,
  verifyEmailAndCreatePassowordValidator,
  userRegisterValidator,
  userEmailValidator,
  tokenValidator,
} from '../../validators/auth/user.validators'

const authRoutes = express.Router()
const userService = new UserService(UserModel)
const tokenService = new TokenService()
const hashService = new HashService()
const notificationService = new NotificationService()
const mailgenService = new MailgenService()

const authController = new AuthController(
  userService,
  tokenService,
  hashService,
  notificationService,
  mailgenService,
  logger
)

authRoutes.post(
  '/register',
  userRegisterValidator,
  validate,
  asyncHandler((req, res, next) => authController.register(req, res, next))
)

authRoutes.post(
  '/verifyEmailAndCreatePassword',
  verifyEmailAndCreatePassowordValidator,
  validate,
  asyncHandler((req, res, next) =>
    authController.verifyEmailAndCreatePassword(req, res, next)
  )
)

authRoutes.post(
  '/login',
  userLoginValidator,
  validate,
  asyncHandler((req, res, next) => authController.login(req, res, next))
)

authRoutes.post(
  '/forgotPassword',
  userEmailValidator,
  validate,
  asyncHandler((req, res, next) =>
    authController.forgotPassword(req, res, next)
  )
)

authRoutes.post(
  '/resetPassword',
  verifyEmailAndCreatePassowordValidator,
  validate,
  asyncHandler((req, res, next) => authController.resetPassword(req, res, next))
)

authRoutes.post(
  '/self',
  tokenValidator,
  validate,
  asyncHandler((req, res, next) => authController.self(req, res, next))
)

export default authRoutes
