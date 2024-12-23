import express from 'express'

import { logger } from '../../logger'
import { UserModel } from '../../models'
import { asyncHandler } from '../../utils'
import { validate } from '../../middlewares'
import { AuthController } from '../../controllers'
import { HashService, TokenService, UserService } from '../../services'
import {
  userLoginValidator,
  verifyEmailAndCreatePassowordValidator,
  userRegisterValidator,
} from '../../validators/auth/user.validators'

const authRoutes = express.Router()
const userService = new UserService(UserModel)
const tokenService = new TokenService()
const hashService = new HashService()
const authController = new AuthController(
  userService,
  tokenService,
  hashService,
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

export default authRoutes
