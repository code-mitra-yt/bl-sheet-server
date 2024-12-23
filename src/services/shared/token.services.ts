import jwt from 'jsonwebtoken'

import { ENV } from '../../config'
import { JwtPayloadType } from '../../types/shared/shared.types'

class TokenService {
  async signToken(payload: JwtPayloadType, exp: string | number = '30 days') {
    return jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET!, {
      expiresIn: exp,
      algorithm: 'HS256',
    })
  }

  verifyToken(token: string) {
    return jwt.verify(token, ENV.ACCESS_TOKEN_SECRET!) as JwtPayloadType
  }
}

export default TokenService
