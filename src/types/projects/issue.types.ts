import { ObjectId } from 'mongoose'

export enum IssueStatus {
  OPEN = 'Open',
  CLOSED = 'Closed',
}

export enum IssuePriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface Issue {
  _id: ObjectId
  memberId: ObjectId
  projectId: ObjectId
  title: string
  description: string
  comments: ObjectId[]
  assignees: ObjectId[]
  attachments: ObjectId[]
  status: IssueStatus
  labels: string[]
  closedDate: Date
  priority: IssuePriority
  closedBy: ObjectId
  isDeleted: boolean
}
