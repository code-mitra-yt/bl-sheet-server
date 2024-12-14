import mongoose from 'mongoose'
import { NextFunction, Request, Response } from 'express'

import { ENV } from '../config'
import { logger } from '../logger'
import { ApiError } from '../utils'

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? 400 : 500
    const message = error.message || 'Something went wrong'
    error = new ApiError(statusCode, message, error?.errors || [], err.stack)
  }

  const response = {
    ...error,
    message: error.message,
    ...(ENV.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  }

  logger.error(`${error.message}`)

  return res.status(error.statusCode).json(response)
}

export default errorHandler
