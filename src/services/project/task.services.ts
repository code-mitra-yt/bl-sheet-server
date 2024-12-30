import mongoose, { ObjectId, PipelineStage } from 'mongoose'
import { TaskModelType } from '../../models'
import { GetTasksQuery, Task } from '../../types/projects/task.types'

class TaskService {
  constructor(private taskModel: TaskModelType) {}

  async getTask(taskId: string, memberId: string) {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(taskId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'members',
          localField: 'memberId',
          foreignField: '_id',
          as: 'member',
        },
      },
      { $unwind: '$member' },
      {
        $lookup: {
          from: 'users',
          localField: 'member.userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'members',
          localField: 'assignees',
          foreignField: '_id',
          as: 'membersDetails',
        },
      },
      {
        $addFields: {
          members: {
            $map: {
              input: '$membersDetails',
              as: 'member',
              in: {
                _id: '$$member._id',
                email: '$$member.email',
              },
            },
          },
          isCreator: {
            $eq: ['$memberId', new mongoose.Types.ObjectId(memberId)],
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          status: 1,
          priority: 1,
          dueDate: 1,
          comments: 1,
          isCreator: 1,
          members: 1,
          creator: {
            fullName: '$user.fullName',
            email: '$member.email',
            role: '$member.role',
            avatar: '$user.avatar',
          },
        },
      },
    ]

    const result = await this.taskModel.aggregate(pipeline).exec()
    if (result.length > 0) return result[0]
    return null
  }

  async createTask(task: Task) {
    return this.taskModel.create(task)
  }

  async getTaskNumber(projectId: string) {
    const latestTask = await this.taskModel
      .findOne({ projectId })
      .sort({ taskNumber: -1 })
      .select('taskNumber')
      .lean()
    const taskNumber = latestTask ? latestTask.taskNumber + 1 : 1
    return taskNumber
  }

  async getTaskById(taskId: string) {
    return this.taskModel.findById(taskId)
  }

  async updateTask(taskId: string, task: Partial<Task>) {
    return this.taskModel.findByIdAndUpdate(taskId, task, {
      new: true,
    })
  }

  async deleteTask(taskId: string) {
    return this.taskModel.findByIdAndUpdate(
      taskId,
      { isDeleted: true },
      { new: true }
    )
  }

  async getTasks(projectId: string, memberId: string, filters: GetTasksQuery) {
    const {
      title,
      createdByMe,
      assignedToMe,
      priority,
      status,
      sortByCreated,
    } = filters

    let searchQuery = new RegExp(title, 'i')
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let pipeline: PipelineStage[] = [
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(projectId),
          isDeleted: false,
          ...(createdByMe && {
            memberId: new mongoose.Types.ObjectId(memberId),
          }),
          ...(assignedToMe && { assignees: { $in: [memberId] } }),
          title: { $regex: searchQuery },
          ...(priority && { priority }),
          $or: [
            { status: { $in: ['Todo', 'In Progress', 'Under Review'] } },
            { status: 'Completed', updatedAt: { $gte: today } },
          ],
          ...(status && { status }),
        },
      },
      {
        $lookup: {
          from: 'members',
          localField: 'memberId',
          foreignField: '_id',
          as: 'creator',
        },
      },
      { $unwind: '$creator' },
      {
        $lookup: {
          from: 'users',
          localField: 'creator.userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'members',
          localField: 'assignees',
          foreignField: '_id',
          as: 'membersDetails',
        },
      },
      {
        $addFields: {
          members: {
            $map: {
              input: '$membersDetails',
              as: 'member',
              in: {
                _id: '$$member._id',
                email: '$$member.email',
              },
            },
          },
          commentCount: { $size: '$comments' },
        },
      },
      {
        $project: {
          projectId: 1,
          title: 1,
          description: 1,
          status: 1,
          priority: 1,
          dueDate: 1,
          tags: 1,
          completedDate: 1,
          subTasks: 1,
          taskType: 1,
          taskNumber: 1,
          isDeleted: 1,
          commentCount: 1,
          creator: {
            memberId: '$creator._id',
            email: '$creator.email',
            role: '$creator.role',
            fullName: '$user.fullName',
            avatar: '$user.avatar',
          },
          members: 1,
        },
      },
      { $sort: { createdAt: sortByCreated ? 1 : -1 } },
    ]

    const tasks = await this.taskModel.aggregate(pipeline).exec()
    return tasks
  }

  async assignMember(taskId: string, memberId: string) {
    return this.taskModel.updateOne(
      { _id: taskId },
      { $addToSet: { assignees: new mongoose.Types.ObjectId(memberId) } }
    )
  }

  async removeAssignedMember(taskId: string, memberId: string) {
    return this.taskModel.findByIdAndUpdate(
      taskId,
      { $pull: { assignees: memberId } },
      { new: true }
    )
  }

  async checkMemberIsAssigned(taskId: string, memberId: string) {
    const task = await this.taskModel.findById(taskId)
    return task?.assignees.includes(memberId as unknown as ObjectId)
  }
}

export default TaskService
