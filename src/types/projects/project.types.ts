import { ObjectId } from 'mongoose'

export interface Project {
  _id: string
  userId: ObjectId
  name: string
  description: string
  tags: string[]
  isDeleted: boolean
}
