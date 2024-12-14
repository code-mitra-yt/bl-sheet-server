import {
  PricingModel,
  UserLoginType,
  UserRoles,
} from '../types/auth/user.types'

export const AvailableUserRoles: string[] = Object.values(UserRoles)
export const AvailableSocialLogins: string[] = Object.values(UserLoginType)
export const AvailablePricingModels: string[] = Object.values(PricingModel)
