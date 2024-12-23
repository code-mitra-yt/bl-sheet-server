import { ObjectId } from 'mongoose'

export enum DocStatus {
  PUBLISHED = 'Published',
  DRAFT = 'Draft',
  ARCHIVED = 'Archived',
}

export enum DocAccessType {
  PRIVATE = 'Private',
  PUBLIC = 'Public',
}

export interface Doc {
  id: ObjectId
  projectId: ObjectId
  memberId: ObjectId
  title: string
  content: string
  accessType: DocAccessType
  status: DocStatus
  assignees: ObjectId[]
  comments: ObjectId[]
  attachments: ObjectId[]
  tags: string[]
}
