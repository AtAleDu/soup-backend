import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { User } from '@entities/User/user.entity'
import type { JwtPayload } from 'jsonwebtoken'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async issueTokens(user: User): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    const accessExpiresIn = Number(
      this.configService.get('JWT_ACCESS_EXPIRES_IN'),
    )

    const refreshExpiresIn = Number(
      this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    )

    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET')!

    const payload = {
      sub: user.id,
      role: user.role,
    }

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: accessExpiresIn,
    })

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    })

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10)

    await this.userRepository.update(user.id, {
      refreshTokenHash,
    })

    return { accessToken, refreshToken }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      })
    } catch {
      throw new UnauthorizedException()
    }
  }

  async getUserIfRefreshTokenMatches(
    userId: string,
    refreshToken: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    })

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException()
    }

    const isMatch = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    )

    if (!isMatch) {
      throw new UnauthorizedException()
    }

    return user
  }

  async register(data: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new BadRequestException('Пользователь уже существует')
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await this.userRepository.save(
      this.userRepository.create({
        ...data,
        password: hashedPassword,
      }),
    )

    return this.issueTokens(user)
  }

  async login(data: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    })

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль')
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.password,
    )

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль')
    }

    return this.issueTokens(user)
  }

  async logout(userId: string) {
    await this.userRepository.update(userId, {
      refreshTokenHash: null,
    })
  }
}
