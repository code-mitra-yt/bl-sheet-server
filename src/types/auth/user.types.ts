export interface Avatar {
  url: string
}

export enum UserRoles {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum UserLoginType {
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
  EMAIL_PASSWORD = 'EMAIL_PASSWORD',
}

export enum PricingModel {
  FREE = 'free',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export interface User {
  _id?: string
  fullName: string
  email: string
  avatar: Avatar
  role: UserRoles
  password: string
  loginType: UserLoginType
  pricingModel: PricingModel
}
