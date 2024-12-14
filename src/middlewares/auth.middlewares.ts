import jwt from 'jsonwebtoken'
import { NextFunction, Response } from 'express'

import { ENV } from '../config'
import { UserModel } from '../models'
import { ApiError, asyncHandler } from '../utils'
import { UserRoles } from '../types/auth/user.types'
import { CustomRequest, JwtPayloadType } from '../types/shared/shared.types'

export const verifyJWT = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      throw new ApiError(401, 'Unauthorized request')
    }

    try {
      const decodedToken = jwt.verify(
        token,
        ENV.ACCESS_TOKEN_SECRET as string
      ) as JwtPayloadType
      const user = await UserModel.findById(decodedToken?._id).select(
        '-password'
      )
      if (!user) {
        throw new ApiError(401, 'Invalid access token')
      }
      req.user = user
      next()
    } catch (error: any) {
      throw new ApiError(401, error?.message || 'Invalid access token')
    }
  }
)

export const getLoggedInUserOrIgnore = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '')

    try {
      const decodedToken = jwt.verify(
        token,
        ENV.ACCESS_TOKEN_SECRET as string
      ) as JwtPayloadType
      const user = await UserModel.findById(decodedToken?._id).select(
        '-password'
      )
      req.user = user
      next()
    } catch (error) {
      next()
    }
  }
)

export const verifyPermission = (roles: UserRoles[] = []) =>
  asyncHandler(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      if (!req.user?._id) {
        throw new ApiError(401, 'Unauthorized request')
      }
      if (roles.includes(req.user?.role)) {
        next()
      } else {
        throw new ApiError(403, 'You are not allowed to perform this action')
      }
    }
  )

export const avoidInProduction = asyncHandler(async (req, res, next) => {
  if (ENV.NODE_ENV === 'development') {
    next()
  } else {
    throw new ApiError(
      403,
      'This service is only available in the local environment. For more details visit: https://github.com/hiteshchoudhary/apihub/#readme'
    )
  }
})
