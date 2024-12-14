import { Model, model, Schema } from 'mongoose'
import { CustomModel } from '../../types/shared/shared.types'
import { PricingModel, User, UserRoles } from '../../types/auth/user.types'
import { AvailablePricingModels, AvailableUserRoles } from '../../constants'

const userShecma = new Schema<CustomModel<User>>(
  {
    fullName: {
      type: String,
      require: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRoles.USER,
    },

    password: {
      type: String,
      required: true,
    },

    pricingModel: {
      type: String,
      enum: AvailablePricingModels,
      default: PricingModel.FREE,
    },

    avatar: {
      type: {
        url: String,
      },
      required: false,
    },
  },

  { timestamps: true }
)

const UserModel: Model<CustomModel<User>> = model<CustomModel<User>>(
  'User',
  userShecma
)

export default UserModel
