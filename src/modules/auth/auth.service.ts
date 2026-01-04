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
import { AuthResponseDto } from './dto/auth-response.dto'
import { User } from '@entities/User/user.entity'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  private async issueTokens(user: User): Promise<AuthResponseDto> {
    const accessExpiresIn = Number(
      this.configService.get('JWT_ACCESS_EXPIRES_IN'),
    )
    const refreshExpiresIn = Number(
      this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    )

    const payload = {
      sub: user.id,
      role: user.role,
    }

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: accessExpiresIn,
    })

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: refreshExpiresIn,
    })

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10)

    await this.userRepository.update(user.id, {
      refreshTokenHash,
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  async register(data: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new BadRequestException(
        'Неверные данные для регистрации',
      )
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

  async login(data: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    })

    if (!user) {
      throw new UnauthorizedException(
        'Неверный email или пароль',
      )
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.password,
    )

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Неверный email или пароль',
      )
    }

    return this.issueTokens(user)
  }
}
