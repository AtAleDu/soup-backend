import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

import { User, UserRole, UserStatus } from "@entities/User/user.entity";
import { Company } from "@entities/Company/company.entity";

import { PasswordService } from "./password/password.service";
import { TokenService } from "./token/token.service";
import { RefreshTokenService } from "./refresh-token/refresh-token.service";
import { VerificationService } from "./verification/verification.service";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,

    @InjectRepository(Company)
    private readonly companies: Repository<Company>,

    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly verificationService: VerificationService,
  ) {}

  // Регистрация нового пользователя и запуск процесса подтверждения email
  async register(dto: RegisterDto) {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException("Пароли не совпадают");
    }

    const exists = await this.users.findOne({
      where: { email: dto.email },
    });

    if (exists) {
      throw new BadRequestException("Пользователь уже существует");
    }

    const user = await this.users.save({
      email: dto.email,
      name: dto.name,
      role: dto.role,
      password: await this.passwordService.hash(dto.password),
      status: UserStatus.PENDING,
    });

    if (user.role === UserRole.СOMPANY) {
      await this.companies.save({
        name: user.name,
        email: user.email,
        password: user.password,
        userId: user.id,
      });
    }

    // Создаём verification-запись для подтверждения email
    return this.verificationService.create(user.id);
  }

  // Логин пользователя и выдача access / refresh токенов
  async login(dto: LoginDto) {
    const user = await this.users.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Неверный email или пароль");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("Email не подтверждён");
    }

    // Проверка пароля
    await this.passwordService.compare(dto.password, user.password);

    // Генерация токенов
    const tokens = await this.tokenService.issue(user);

    // Сохранение refresh token
    await this.refreshTokenService.save(user.id, tokens.refreshToken);

    return tokens;
  }

  // Обновление access token по refresh token
  async refresh(userId: string, refreshToken: string) {
    // Проверяем refresh token и получаем пользователя
    const user = await this.refreshTokenService.validate(userId, refreshToken);

    // Перевыпускаем токены
    const tokens = await this.tokenService.issue(user);

    // Сохраняем новый refresh token
    await this.refreshTokenService.save(user.id, tokens.refreshToken);

    return tokens;
  }

  // Выход пользователя из системы (инвалидация refresh token)
  async logout(userId: string) {
    await this.refreshTokenService.revoke(userId);
  }
}
