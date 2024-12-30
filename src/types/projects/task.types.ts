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
  _id: ObjectId
  memberId: ObjectId
  projectId: ObjectId
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: Date
  assignees: ObjectId[]
  completedDate: Date
  attachments: ObjectId[]
  comments: ObjectId[]
  subTasks: string[]
  taskType: string
  taskNumber: number
  isDeleted: boolean
}

export interface GetTasksQuery {
  projectId: string
  title: string
  priority: TaskPriority
  status: TaskStatus
  assignedToMe: boolean
  createdByMe: boolean
  sortByCreated: boolean
}
