import { Response } from 'express'
import { Logger } from 'winston'

import { MSG } from '../../constants'
import { ApiError, ApiResponse } from '../../utils'
import { CustomRequest } from '../../types/shared/shared.types'
import { GetTasksQuery, Task } from '../../types/projects/task.types'
import {
  MailgenService,
  MemberService,
  NotificationService,
  ProjectService,
  TaskService,
} from '../../services'
import { InvitationStatus, MemberRole } from '../../types/projects/member.types'

class TaskController {
  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
    private memberService: MemberService,
    private notificationService: NotificationService,
    private mailgenService: MailgenService,
    private logger: Logger
  ) {}

  async getTask(req: CustomRequest, res: Response) {
    const userId = req.user?._id as string
    const { taskId, projectId } = req.query

    const member = await this.memberService.getMemberByUserIdAndProjectId(
      userId,
      projectId as string
    )
    if (!member) throw new ApiError(404, 'Member not found')

    const project = await this.projectService.getProjectById(
      projectId as string
    )
    if (!project) throw new ApiError(404, 'Project not found')

    const task = await this.taskService.getTask(
      taskId as string,
      member._id as unknown as string
    )
    if (!task) throw new ApiError(404, 'Task not found')

    return res
      .status(200)
      .json(new ApiResponse(200, { task }, 'Task fetched successfully'))
  }

  async getTasks(req: CustomRequest, res: Response) {
    const userId = req.user?._id as string
    const projectId = req.query.projectId as string
    const query = req.query as unknown as GetTasksQuery

    const member = await this.memberService.getMemberByUserIdAndProjectId(
      userId,
      projectId
    )
    if (!member) throw new ApiError(404, 'Member not found')

    const tasks = await this.taskService.getTasks(
      projectId,
      member._id as unknown as string,
      query
    )
    return res
      .status(200)
      .json(new ApiResponse(200, { tasks }, 'Tasks fetched successfully'))
  }

  async createTask(req: CustomRequest<Task>, res: Response) {
    const userId = req.user?._id as string
    const task = req.body

    this.logger.info({
      msg: MSG.TASK.CREATE_TASK,
      data: { userId, task },
    })

    const project = await this.projectService.getProjectById(
      task.projectId as unknown as string
    )
    if (!project) throw new ApiError(404, 'Project not found')

    const member = await this.memberService.getMemberByUserIdAndProjectId(
      userId,
      task.projectId as unknown as string
    )
    if (!member) throw new ApiError(404, 'Member not found')
    if (member.invitationStatus !== InvitationStatus.ACCEPTED)
      throw new ApiError(403, 'Your are not allowed to create a task')

    const taskNumber = await this.taskService.getTaskNumber(
      task.projectId as unknown as string
    )
    const createdTask = await this.taskService.createTask({
      ...task,
      memberId: member._id,
      taskNumber,
    })

    //TODO: Send notification to owner of task creation

    res
      .status(201)
      .json(
        new ApiResponse(201, { task: createdTask }, 'Task created successfully')
      )
  }

  async updateTask(
    req: CustomRequest<Task & { taskId: string }>,
    res: Response
  ) {
    const userId = req.user?._id as string
    const taskId = req.body.taskId
    const task = req.body

    this.logger.info({
      msg: MSG.TASK.UPDATE_TASK,
      data: { userId, taskId, task },
    })

    const member = await this.memberService.getMemberByUserIdAndProjectId(
      userId,
      task.projectId as unknown as string
    )
    if (!member) throw new ApiError(404, 'Task not found')

    const existingTask = await this.taskService.getTaskById(taskId)
    if (!existingTask) throw new ApiError(404, 'Task not found')

    if (
      member.role === MemberRole.MEMBER &&
      member._id.toString() !== existingTask.memberId.toString()
    )
      throw new ApiError(403, 'You are not allowed to update this task')

    const updatedTask = await this.taskService.updateTask(taskId, task)

    res
      .status(200)
      .json(
        new ApiResponse(200, { task: updatedTask }, 'Task updated successfully')
      )
  }

  async deleteTask(
    req: CustomRequest<{ projectId: string; taskId: string }>,
    res: Response
  ) {
    const userId = req.user?._id as string
    const { taskId, projectId } = req.body

    this.logger.info({
      msg: MSG.TASK.DELETE_TASK,
      data: { userId, taskId },
    })

    const member = await this.memberService.getMemberByUserIdAndProjectId(
      userId,
      projectId
    )
    if (!member) throw new ApiError(404, 'Member not found')

    const existingTask = await this.taskService.getTaskById(taskId)
    if (!existingTask) throw new ApiError(404, 'Task not found')

    if (
      member.role === MemberRole.MEMBER &&
      member._id.toString() !== existingTask.memberId.toString()
    )
      throw new ApiError(403, 'You are not allowed to delete this task')

    await this.taskService.deleteTask(taskId)

    return res
      .status(200)
      .json(new ApiResponse(200, { taskId }, 'Task deleted successfully'))
  }

  async assignMember(
    req: CustomRequest<{ taskId: string; memberId: string; projectId: string }>,
    res: Response
  ) {
    const userId = req.user?._id as string
    const { taskId, memberId, projectId } = req.body

    this.logger.info({
      msg: MSG.TASK.ASSIGN_MEMBER,
      data: { userId, taskId, memberId, projectId },
    })

    const task = await this.taskService.getTaskById(taskId)
    if (!task) throw new ApiError(404, 'Task not found')

    const member = await this.memberService.getMemberByUserIdAndProjectId(
      userId,
      projectId
    )
    if (!member) throw new ApiError(404, 'Member not found')
    if (member.role === MemberRole.MEMBER)
      throw new ApiError(403, 'You are not allowed to assign members to tasks')

    const assignedMember = await this.memberService.getMemberById(memberId)
    if (!assignedMember) throw new ApiError(404, 'Assignee not found')

    const isAssigned = await this.taskService.checkMemberIsAssigned(
      taskId,
      memberId
    )
    if (isAssigned) throw new ApiError(400, 'Member is assigned already')

    await this.taskService.assignMember(taskId, memberId)

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { taskId, memberId },
          'Member assigned to task successfully'
        )
      )
  }

  async removeAssignedMember(
    req: CustomRequest<{ taskId: string; memberId: string; projectId: string }>,
    res: Response
  ) {
    const userId = req.user?._id as string
    const { taskId, memberId, projectId } = req.body

    this.logger.info({
      msg: MSG.TASK.REMOVE_ASSINGED_MEMBER,
      data: { userId, taskId, memberId, projectId },
    })

    const task = await this.taskService.getTaskById(taskId)
    if (!task) throw new ApiError(404, 'Task not found')

    const member = await this.memberService.getMemberByUserIdAndProjectId(
      userId,
      projectId
    )
    if (!member) throw new ApiError(404, 'Member not found')
    if (member.role === MemberRole.MEMBER)
      throw new ApiError(403, 'You are not allowed to assign members to tasks')

    const assignedMember = await this.memberService.getMemberById(memberId)
    if (!assignedMember) throw new ApiError(404, 'Assignee member not found')

    const isAssigned = await this.taskService.checkMemberIsAssigned(
      taskId,
      memberId
    )
    if (!isAssigned) throw new ApiError(400, 'Member is not assigned')

    await this.taskService.removeAssignedMember(taskId, memberId)

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { taskId, memberId },
          'Assigned member removed successfully'
        )
      )
  }
}

export default TaskController
