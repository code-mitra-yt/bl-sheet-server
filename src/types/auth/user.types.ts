export interface Avatar {
  url: string
}

export enum UserRoles {
  ADMIN = 'Admin',
  USER = 'User',
}

export enum UserLoginType {
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
  EMAIL_PASSWORD = 'EMAIL_PASSWORD',
}

export enum PricingModel {
  FREE = 'Free',
  PREMIUM = 'Premium',
  ENTERPRISE = 'Enterprise',
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

export interface VerifyEmailAndCreatePasswordBody {
  password: string
  confirmPassword: string
  token: string
}
