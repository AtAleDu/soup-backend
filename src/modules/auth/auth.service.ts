import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

import {
  User,
  UserStatus,
} from '@entities/User/user.entity'

import { PasswordService } from './password/password.service'
import { TokenService } from './token/token.service'
import { RefreshTokenService } from './refresh-token/refresh-token.service'
import { VerificationService } from './verification/verification.service'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,

    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly verificationService: VerificationService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('Пароли не совпадают')
    }

    const exists = await this.users.findOne({
      where: { email: dto.email },
    })

    if (exists) {
      throw new BadRequestException('Пользователь уже существует')
    }

    const user = await this.users.save({
      email: dto.email,
      name: dto.name,
      role: dto.role,
      password: await this.passwordService.hash(dto.password),
      status: UserStatus.PENDING,
    })

    return this.verificationService.create(user.id)
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({
      where: { email: dto.email },
    })

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль')
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Email не подтверждён')
    }

    await this.passwordService.compare(dto.password, user.password)

    const tokens = await this.tokenService.issue(user)
    await this.refreshTokenService.save(
      user.id,
      tokens.refreshToken,
    )

    return tokens
  }

  async refresh(userId: string, refreshToken: string) {
    const user =
      await this.refreshTokenService.validate(
        userId,
        refreshToken,
      )

    const tokens = await this.tokenService.issue(user)
    await this.refreshTokenService.save(
      user.id,
      tokens.refreshToken,
    )

    return tokens
  }

  async logout(userId: string) {
    await this.refreshTokenService.revoke(userId)
  }
}
