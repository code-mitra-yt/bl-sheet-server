import express from 'express'

import { asyncHandler } from '../../utils'
import { AuthController } from '../../controllers'

const authRoutes = express.Router()
const authController = new AuthController()

authRoutes
  .route('/')
  .get(asyncHandler((req, res, next) => authController.getUser(req, res, next)))
  .post(
    asyncHandler((req, res, next) => authController.createUser(req, res, next))
  )
  .delete(
    asyncHandler((req, res, next) => authController.updateUser(req, res, next))
  )
  .patch(
    asyncHandler((req, res, next) => authController.updateUser(req, res, next))
  )

export default authRoutes
