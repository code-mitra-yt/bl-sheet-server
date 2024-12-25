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
  _id?: ObjectId
  userId: ObjectId
  projectId: ObjectId
  email: string
  role?: MemberRole
  invitationStatus?: InvitationStatus
}

export interface GetMemberQuery {
  projectId: string
  page: number
  limit: number
  email: string
  invitationStatus: InvitationStatus
}
