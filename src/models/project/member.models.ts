import { AggregatePaginateModel, model, Model, Schema } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import {
  AvailableMemberRoles,
  AvailableInvitationStatus,
} from '../../constants'
import { CustomModel } from '../../types/shared/shared.types'
import {
  InvitationStatus,
  Member,
  MemberRole,
} from '../../types/projects/member.types'

const memberSchema = new Schema<CustomModel<Member>>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },

    email: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: AvailableMemberRoles,
      default: MemberRole.MEMBER,
    },

    invitationStatus: {
      type: String,
      enum: AvailableInvitationStatus,
      default: InvitationStatus.PENDING,
    },
  },

  { timestamps: true }
)

memberSchema.plugin(mongooseAggregatePaginate)

export type MemberModelType = Model<Member> & AggregatePaginateModel<Member>

const MemberModel: Model<CustomModel<Member>> = model<CustomModel<Member>>(
  'Member',
  memberSchema
)

export default MemberModel
