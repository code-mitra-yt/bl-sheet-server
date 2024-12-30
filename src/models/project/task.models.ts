import { AggregatePaginateModel, model, Model, Schema } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import { AvailableTaskStatus, AvailableTaskPriority } from '../../constants'
import { Task, TaskPriority, TaskStatus } from '../../types/projects/task.types'
import { CustomModel } from '../../types/shared/shared.types'

const taskSchema = new Schema<CustomModel<Task>>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: AvailableTaskStatus,
      default: TaskStatus.TODO,
    },

    priority: {
      type: String,
      enum: AvailableTaskPriority,
      default: TaskPriority.LOW,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    assignees: {
      type: [Schema.Types.ObjectId],
      ref: 'Member',
      default: [],
    },

    completedDate: {
      type: Date,
      default: null,
    },

    attachments: {
      type: [Schema.Types.ObjectId],
      ref: 'Attachment',
      default: [],
    },

    comments: {
      type: [Schema.Types.ObjectId],
      ref: 'Comment',
    },

    subTasks: {
      type: [String],
      default: [],
    },

    taskType: {
      type: String,
      required: true,
    },

    taskNumber: {
      type: Number,
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
)

taskSchema.plugin(mongooseAggregatePaginate)

export type TaskModelType = Model<Task> & AggregatePaginateModel<Task>

const TaskModel: Model<CustomModel<Task>> = model<CustomModel<Task>>(
  'Task',
  taskSchema
)

export default TaskModel
