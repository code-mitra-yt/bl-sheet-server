import { UserModel } from '../../models'
import { User } from '../../types/auth/user.types'

class UserService {
  constructor(private userModel: typeof UserModel) {}

  getUserById(userId: string) {
    return this.userModel.findById(userId)
  }

  getUserByEmail(email: string) {
    return this.userModel.findOne({ email })
  }

  createUser(user: { email: string; password: string; fullName: string }) {
    return this.userModel.create(user)
  }
}

export default UserService
