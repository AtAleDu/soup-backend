import { Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }

  async compare(password: string, hash: string): Promise<void> {
    const ok = await bcrypt.compare(password, hash)
    if (!ok) {
      throw new UnauthorizedException('Неверный email или пароль')
    }
  }
}
