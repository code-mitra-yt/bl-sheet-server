import { Request } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import { User } from '../auth/user.types'
import { ObjectId } from 'mongoose'

export interface CustomRequest<T = null> extends Request {
  body: T
  user?: User | null
}

export type CustomModel<T> = T & Document

export interface JwtPayloadType extends JwtPayload {
  user: { _id?: string; fullName?: string; email?: string }
}

export interface NotificationMessage {
  to: string
  text: string
  html?: string
  subject?: string
  from?: string
}

export interface Comment {
  content: string
  memberId: ObjectId
  likes?: number
  replies?: ObjectId[]
  commentType: string
}
