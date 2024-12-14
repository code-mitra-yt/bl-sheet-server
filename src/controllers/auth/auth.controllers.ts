import { NextFunction, Request, Response } from 'express'
import { ApiResponse } from '../../utils'

class AuthController {
  constructor() {}

  async getUser(req: Request, res: Response, next: NextFunction) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { userId: '123' }, 'User fetched successfully')
      )
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    return res
      .status(201)
      .json(
        new ApiResponse(201, { userId: '123' }, 'User Created Successfully')
      )
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { userId: '123' }, 'User Updated Successfully')
      )
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { userId: '123' }, 'User Deleted Successfully')
      )
  }
}

export default AuthController
