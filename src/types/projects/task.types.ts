import { ObjectId } from 'mongoose'

export enum TaskStatus {
  TODO = 'Todo',
  IN_PROGRESS = 'In Progress',
  UNDER_REVIEW = 'Under Review',
  COMPLETED = 'Completed',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface Task {
  id: ObjectId
  memberId: ObjectId
  projectId: ObjectId
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  startDate: Date
  endDate: Date
  tags: string[]
  assignees: ObjectId[]
  completedDate: Date
  attachments: ObjectId[]
  comments: ObjectId[]
  subTasks: string[]
  taskType: string
  taskNumber: number
}
