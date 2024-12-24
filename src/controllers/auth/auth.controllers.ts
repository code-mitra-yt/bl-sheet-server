import { NextFunction, Response } from 'express'
import { Logger } from 'winston'

import { ENV } from '../../config'
import { MSG, URLS } from '../../constants'
import { ApiError, ApiResponse } from '../../utils'
import {
  HashService,
  MailgenService,
  NotificationService,
  TokenService,
  UserService,
} from '../../services'

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
    private notificationService: NotificationService,
    private mailgenService: MailgenService,
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

    const { emailHTML, emailText } = this.mailgenService.verificationEmailHTML({
      name: fullName,
      link: verificationLink,
    })

    await this.notificationService.send({
      to: email,
      subject: 'Verify Email and Create Password',
      text: emailText,
      html: emailHTML,
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { fullName, email },
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
            avatar: user.avatar,
            role: user.role,
            pricingModel: user.pricingModel,
          },
          token: accessToken,
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
            avatar: user.avatar,
            role: user.role,
            pricingModel: user.pricingModel,
          },
          token: accessToken,
        },
        'User logged in successfully.'
      )
    )
  }

  async forgotPassword(
    req: CustomRequest<{ email: string }>,
    res: Response,
    next: NextFunction
  ) {
    const { email } = req.body
    this.logger.info({ msg: MSG.AUTH.FORGOT_PASSWORD, data: { email } })

    const user = await this.userService.getUserByEmail(email)
    if (!user) throw new ApiError(409, 'User with email not exists.')

    const EXP = '2 days'
    const resetPasswordToken = await this.tokenService.signToken(
      { user: { email: user.email, fullName: user.fullName, _id: user._id } },
      EXP
    )

    const resetPasswordLink = `${ENV.FRONTEND_URL!}${
      URLS.resetPasswordUrl
    }?token=${resetPasswordToken}`

    const { emailHTML, emailText } = this.mailgenService.resetPasswordEmailHTML(
      {
        name: user.fullName,
        link: resetPasswordLink,
      }
    )

    await this.notificationService.send({
      to: email,
      subject: 'Reset Your BL Sheet Password',
      text: emailText,
      html: emailHTML,
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { email: user.email, resetPasswordLink },
          'Reset password link has been sent to your email'
        )
      )
  }

  async resetPassword(
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
    if (!existedUser) throw new ApiError(409, 'User with email not exists.', [])

    this.logger.info({
      msg: MSG.AUTH.RESET_PASSWORD,
      data: { userId: existedUser._id, email: existedUser.email },
    })

    const hashedPassword = await this.hashService.hashData(password)
    await this.userService.updateUser(existedUser._id, {
      password: hashedPassword,
    })

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          _id: existedUser._id,
          email: existedUser.email,
          fullName: existedUser.fullName,
        },
        'Your password has been reset successfully'
      )
    )
  }

  async self(
    req: CustomRequest<{ token: string }>,
    res: Response,
    next: NextFunction
  ) {
    const { token } = req.body

    const decodedToken = this.tokenService.verifyToken(token)
    if (
      !decodedToken?.user ||
      !decodedToken?.user?.email ||
      !decodedToken?.user?.fullName
    )
      throw new ApiError(401, 'The token provided is invalid or expired.')

    if ((decodedToken?.exp || 0) * 1000 < Date.now())
      throw new ApiError(
        401,
        'We are sorry, but your token has expired. Please request a new token to proceed.'
      )

    const user = await this.userService.getUserByEmail(
      decodedToken?.user?.email
    )
    if (!user) throw new ApiError(409, 'User with email not exists.', [])

    this.logger.info({
      msg: MSG.AUTH.SELF,
      data: { userId: user?._id, email: user.email },
    })

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
            role: user.role,
            pricingModel: user.pricingModel,
          },
          token,
        },
        'Fetched users details successfully'
      )
    )
  }
}

export default AuthController
