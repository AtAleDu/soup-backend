import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as crypto from "crypto";

import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

import { User, UserRole, UserStatus } from "@entities/User/user.entity";
import { Company } from "@entities/Company/company.entity";
import { CompanyStatus } from "@entities/Company/company-status.enum";
import { Client } from "@entities/Client/client.entity";
import { ClientStatus } from "@entities/Client/client-status.enum";
import { Tariff } from "@entities/Tarif/tariff.entity";
import { PasswordResetToken } from "@entities/PasswordResetToken/password-reset-token.entity";
import {
  VerificationSession,
  VerificationStatus,
} from "@entities/VerificationSession/verification-session.entity";

import { PasswordService } from "./password/password.service";
import { TokenService } from "./token/token.service";
import { RefreshTokenService } from "./refresh-token/refresh-token.service";
import { VerificationService } from "./verification/verification.service";
import { EmailService } from "@infrastructure/email/email.service";
import {
  generateVerificationCode,
  hashVerificationCode,
} from "./verification/verification.util";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,

    @InjectRepository(Company)
    private readonly companies: Repository<Company>,

    @InjectRepository(Client)
    private readonly clients: Repository<Client>,

    @InjectRepository(Tariff)
    private readonly tariffs: Repository<Tariff>,

    @InjectRepository(VerificationSession)
    private readonly sessions: Repository<VerificationSession>,

    @InjectRepository(PasswordResetToken)
    private readonly resetTokens: Repository<PasswordResetToken>,

    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly verificationService: VerificationService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
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

    const defaultTariff =
      dto.role === UserRole.СOMPANY
        ? await this.tariffs.findOne({ where: { name: "basic" } })
        : null;
    const now = new Date();
    const tariffEndAt =
      defaultTariff?.duration_days != null
        ? new Date(
            now.getTime() + defaultTariff.duration_days * 24 * 60 * 60 * 1000,
          )
        : null;

    const user = await this.users.save({
      email: dto.email,
      name: dto.name,
      role: dto.role,
      password: await this.passwordService.hash(dto.password),
      status: UserStatus.PENDING,
      tariff: defaultTariff ?? null,
      tariffStartAt: defaultTariff ? now : null,
      tariffEndAt,
    });

    if (user.role === UserRole.СOMPANY) {
      await this.companies.save({
        name: user.name,
        userId: user.id,
        status: CompanyStatus.PENDING,
      });
    }

    if (user.role === UserRole.CLIENT) {
      await this.clients.save({
        userId: user.id,
        full_name: user.name,
        status: ClientStatus.PENDING,
        contacts: [
          {
            type: "email",
            value: user.email,
          },
        ],
      });
    }

    try {
      return await this.verificationService.create(user.id, user.email);
    } catch (error) {
      await this.companies.delete({ userId: user.id });
      await this.users.delete(user.id);
      throw error;
    }
  }

  // Подтверждение регистрации по коду и автоматический логин пользователя
  async verify(verificationId: string, code: string) {
    const { userId } = await this.verificationService.verify(
      verificationId,
      code,
    );

    const user = await this.users.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException("Пользователь не найден");
    }

    user.status = UserStatus.ACTIVE;
    await this.users.save(user);

    // После успешной активации сразу логиним пользователя
    const tokens = await this.tokenService.issue(user);
    await this.refreshTokenService.save(user.id, tokens.refreshToken);

    return { success: true, tokens };
  }

  // Повторная отправка кода подтверждения
  async resend(verificationId: string) {
    const session = await this.sessions.findOne({
      where: { id: verificationId },
    });

    if (!session) {
      throw new BadRequestException("Сессия не найдена");
    }

    const user = await this.users.findOne({
      where: { id: session.userId },
    });

    if (!user) {
      throw new BadRequestException("Пользователь не найден");
    }

    return this.verificationService.resend(session, user.email);
  }

  // Логин пользователя и выдача access / refresh токенов
  async login(dto: LoginDto) {
    const user = await this.users.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Неверный email или пароль");
    }

    // Проверка пароля до проверки статуса, чтобы не раскрывать наличие пользователя
    await this.passwordService.compare(dto.password, user.password);

    if (user.status !== UserStatus.ACTIVE) {
      const existing = await this.sessions.findOne({
        where: {
          userId: user.id,
          status: VerificationStatus.PENDING,
        },
        order: { createdAt: "DESC" },
      });
      const now = Date.now();
      const hasValidSession =
        existing && existing.expiresAt.getTime() > now;

      const verificationId = hasValidSession
        ? existing!.id
        : (await this.verificationService.create(user.id, user.email))
            .verificationId;

      throw new ForbiddenException({
        code: "EMAIL_NOT_VERIFIED",
        verificationId,
      });
    }

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

  // Запрос на восстановление пароля
  async requestPasswordReset(email: string) {
    const user = await this.users.findOne({ where: { email } });

    if (!user) {
      return { success: true };
    }

    if (user.status !== UserStatus.ACTIVE) {
      return { success: true };
    }

    const lastToken = await this.resetTokens.findOne({
      where: { userId: user.id },
      order: { createdAt: "DESC" },
    });

    if (lastToken && Date.now() - lastToken.createdAt.getTime() < 60_000) {
      throw new BadRequestException("Подождите перед повторным запросом");
    }

    await this.resetTokens.delete({ userId: user.id });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await this.resetTokens.save({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      usedAt: null,
    });

    const frontendUrl =
      this.configService.get<string>("FRONTEND_URL") || "http://localhost:3000";

    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;
    try {
      await this.emailService.sendPasswordResetLink(user.email, resetLink);
    } catch (error) {
      await this.resetTokens.delete({ userId: user.id });
      throw error;
    }

    return { success: true };
  }

  // Сброс пароля по токену и автоматический логин пользователя
  async resetPassword(
    token: string,
    password: string,
    passwordConfirm: string,
  ) {
    if (password !== passwordConfirm) {
      throw new BadRequestException("Пароли не совпадают");
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const record = await this.resetTokens.findOne({
      where: { tokenHash },
    });

    if (!record) {
      throw new BadRequestException("Ссылка недействительна");
    }

    if (record.usedAt) {
      throw new BadRequestException("Ссылка уже использована");
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException("Ссылка истекла");
    }

    const user = await this.users.findOne({ where: { id: record.userId } });
    if (!user) {
      throw new BadRequestException("Пользователь не найден");
    }

    // Обновляем пароль
    user.password = await this.passwordService.hash(password);
    await this.users.save(user);

    // Инвалидируем все старые refresh-токены
    await this.refreshTokenService.revoke(user.id);

    // Выпускаем новый набор токенов после успешного сброса пароля
    const tokens = await this.tokenService.issue(user);
    await this.refreshTokenService.save(user.id, tokens.refreshToken);

    // Помечаем токен сброса использованным и очищаем остальные токены сброса
    record.usedAt = new Date();
    await this.resetTokens.save(record);
    await this.resetTokens.delete({ userId: user.id });

    // Возвращаем success для фронта и токены для контроллера
    return { success: true, tokens };
  }

  // Изменение email в процессе верификации
  async updateVerificationEmail(verificationId: string, newEmail: string) {
    const session = await this.sessions.findOne({
      where: { id: verificationId },
    });

    if (!session) {
      throw new BadRequestException("Сессия не найдена");
    }

    if (session.status !== VerificationStatus.PENDING) {
      throw new BadRequestException("Сессия недействительна");
    }

    if (session.expiresAt.getTime() < Date.now()) {
      session.status = VerificationStatus.LOCKED;
      await this.sessions.save(session);
      throw new BadRequestException("Код истёк");
    }

    if (session.resendCount >= 3) {
      throw new BadRequestException("Превышен лимит повторных отправок");
    }

    const user = await this.users.findOne({
      where: { id: session.userId },
    });

    if (!user) {
      throw new BadRequestException("Пользователь не найден");
    }

    if (user.status !== UserStatus.PENDING) {
      throw new BadRequestException("Email уже подтверждён");
    }

    const exists = await this.users.findOne({
      where: { email: newEmail },
    });

    if (exists && exists.id !== user.id) {
      throw new BadRequestException("Email уже используется");
    }

    const previousEmail = user.email;
    user.email = newEmail;
    await this.users.save(user);

    if (user.role === UserRole.CLIENT) {
      const client = await this.clients.findOne({
        where: { userId: user.id },
      });
      const contacts = Array.isArray(client?.contacts)
        ? client.contacts.map((c) =>
            c.type === "email" ? { ...c, value: newEmail } : c,
          )
        : [];
      const hasEmail = contacts.some((c) => c.type === "email");
      const newContacts = hasEmail
        ? contacts
        : [...contacts, { type: "email" as const, value: newEmail }];
      await this.clients.update({ userId: user.id }, { contacts: newContacts });
    }

    if (user.role === UserRole.СOMPANY) {
      await this.companies.update(
        { userId: user.id },
        { email: newEmail },
      );
    }

    const code = generateVerificationCode();
    const newSession = await this.sessions.save({
      userId: session.userId,
      codeHash: hashVerificationCode(code),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      attemptsLeft: 5,
      status: VerificationStatus.PENDING,
      resendCount: session.resendCount + 1,
      lastSentAt: new Date(),
    });

    try {
      await this.emailService.sendVerificationCode(newEmail, code);
    } catch (error) {
      await this.sessions.delete(newSession.id);
      user.email = previousEmail;
      await this.users.save(user);
      if (user.role === UserRole.CLIENT) {
        const client = await this.clients.findOne({
          where: { userId: user.id },
        });
        if (client?.contacts) {
          const contacts = client.contacts.map((c) =>
            c.type === "email" ? { ...c, value: previousEmail } : c,
          );
          await this.clients.update(
            { userId: user.id },
            { contacts },
          );
        }
      }
      if (user.role === UserRole.СOMPANY) {
        await this.companies.update(
          { userId: user.id },
          { email: previousEmail },
        );
      }
      throw error;
    }

    session.status = VerificationStatus.EXPIRED;
    await this.sessions.save(session);

    return {
      verificationId: newSession.id,
    };
  }
}
