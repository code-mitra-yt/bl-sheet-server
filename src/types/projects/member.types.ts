import { ObjectId } from 'mongoose'

export enum MemberRole {
  ADMIN = 'Admin',
  MEMBER = 'Member',
  OWNER = 'Owner',
}

export enum InvitationStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}

export interface Member {
  id: ObjectId
  userId: ObjectId
  projectId: ObjectId
  email: string
  role: MemberRole
  invitationStatus: InvitationStatus
}
