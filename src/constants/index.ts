import {
  PricingModel,
  UserLoginType,
  UserRoles,
} from '../types/auth/user.types'
import { DocAccessType, DocStatus } from '../types/projects/doc.types'
import { InvitationStatus, MemberRole } from '../types/projects/member.types'
import { TaskPriority, TaskStatus } from './../types/projects/task.types'

export const AvailableUserRoles: string[] = Object.values(UserRoles)
export const AvailableSocialLogins: string[] = Object.values(UserLoginType)
export const AvailablePricingModels: string[] = Object.values(PricingModel)
export const AvailableTaskPriority: string[] = Object.values(TaskPriority)
export const AvailableTaskStatus: string[] = Object.values(TaskStatus)
export const AvailableMemberRoles: string[] = Object.values(MemberRole)
export const AvailableInvitationStatus: string[] =
  Object.values(InvitationStatus)
export const AvailableDocStatus: string[] = Object.values(DocStatus)
export const AvailableAccessType: string[] = Object.values(DocAccessType)
