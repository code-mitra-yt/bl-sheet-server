import { NextFunction, Response } from 'express'
import { Logger } from 'winston'

import { ENV } from '../../config'
import URLS from '../../constants/urls'
import { MSG } from '../../constants/msg'
import { ApiError, ApiResponse } from '../../utils'
import { HashService, TokenService, UserService } from '../../services'

import { CustomRequest } from '../../types/shared/shared.types'
import {
  User,
  VerifyEmailAndCreatePasswordBody,
} from '../../types/auth/user.types'

class AuthController {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private hashService: HashService,
    private logger: Logger
  ) {}

  async register(req: CustomRequest<User>, res: Response, next: NextFunction) {
    const { email, fullName } = req.body
    this.logger.info({
      msg: MSG.AUTH.USER_REGISTERED,
      data: { email, fullName },
    })

    const existedUser = await this.userService.getUserByEmail(email)
    if (existedUser)
      throw new ApiError(409, 'User with email already exists.', [])

    const EXP = '10m'
    const verifyEmailToken = await this.tokenService.signToken(
      { user: { fullName, email } },
      EXP
    )

    const verificationLink = `${ENV.FRONTEND_URL!}${
      URLS.createPasswordUrl
    }?token=${verifyEmailToken}`

    //TODO: Send notification for verification email

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { fullName, email, verificationLink },
          'The verification email has been sent successfully to the provided email address.'
        )
      )
  }

  async verifyEmailAndCreatePassword(
    req: CustomRequest<VerifyEmailAndCreatePasswordBody>,
    res: Response,
    next: NextFunction
  ) {
    const { password, token } = req.body

    const decodedToken = this.tokenService.verifyToken(token)
    if (
      !decodedToken?.user ||
      !decodedToken?.user?.email ||
      !decodedToken?.user?.fullName
    )
      throw new ApiError(400, 'The token provided is invalid or expired.')

    if ((decodedToken?.exp || 0) * 1000 < Date.now())
      throw new ApiError(
        400,
        'We are sorry, but your token has expired. Please request a new token to proceed.'
      )

    const existedUser = await this.userService.getUserByEmail(
      decodedToken?.user?.email
    )
    if (existedUser)
      throw new ApiError(409, 'User with email already exists.', [])

    const hashedPassword = await this.hashService.hashData(password)

    const user = await this.userService.createUser({
      email: decodedToken.user.email,
      fullName: decodedToken.user.fullName,
      password: hashedPassword,
    })

    this.logger.info({
      msg: MSG.AUTH.USER_VERIFIED,
      data: { userId: user._id, fullName: user.fullName, email: user.fullName },
    })

    const accessToken = await this.tokenService.signToken({
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    })

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            token: accessToken,
          },
        },
        'Your email has been successfully verified, and your password has been created.'
      )
    )
  }

  async login(req: CustomRequest<User>, res: Response, next: NextFunction) {
    const { email, password } = req.body

    const user = await this.userService.getUserByEmail(email)
    if (!user) throw new ApiError(401, 'User not found with this email.', [])

    const isMatch = await this.hashService.hashCompare(password, user.password)
    if (!isMatch) throw new ApiError(400, 'Invalid user credentials')

    const accessToken = await this.tokenService.signToken({
      user: { _id: user._id, email: user.email, fullName: user.fullName },
    })

    this.logger.info({
      msg: MSG.AUTH.USER_LOGGED_IN,
      data: { userId: user._id, fullName: user.fullName, email: user.email },
    })

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            token: accessToken,
          },
        },
        'User logged in successfully.'
      )
    )
  }
}

export default AuthController