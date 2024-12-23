import { Request } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import { User } from '../auth/user.types'

export interface CustomRequest<T = null> extends Request {
  body: T
  user?: User | null
}

export type CustomModel<T> = T & Document

export interface JwtPayloadType extends JwtPayload {
  user: { _id?: string; fullName?: string; email?: string }
}
