import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from '@entities/User/user.entity'

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async save(userId: string, token: string) {
    const hash = await bcrypt.hash(token, 10)
    await this.users.update(userId, { refreshTokenHash: hash })
  }

  async validate(userId: string, token: string): Promise<User> {
    const user = await this.users.findOne({ where: { id: userId } })
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException()
    }

    const ok = await bcrypt.compare(token, user.refreshTokenHash)
    if (!ok) throw new UnauthorizedException()

    return user
  }

  async revoke(userId: string) {
    await this.users.update(userId, { refreshTokenHash: null })
  }
}
