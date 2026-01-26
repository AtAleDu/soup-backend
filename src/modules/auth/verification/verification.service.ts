import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import {
  VerificationSession,
  VerificationStatus,
} from "@entities/VerificationSession/verification-session.entity";
import {
  generateVerificationCode,
  hashVerificationCode,
} from "./verification.util";
import { EmailService } from "@infrastructure/email/email.service";

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(VerificationSession)
    private readonly sessions: Repository<VerificationSession>,

    private readonly emailService: EmailService,
  ) {}

  /**
   * Создание новой verification-сессии (при регистрации)
   */
  async create(userId: string, email: string) {
    const code = generateVerificationCode();

    const session = await this.sessions.save({
      userId,
      codeHash: hashVerificationCode(code),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      attemptsLeft: 5,
      status: VerificationStatus.PENDING,
      resendCount: 0,
      lastSentAt: new Date(),
    });

    try {
      await this.emailService.sendVerificationCode(email, code);
    } catch (error) {
      await this.sessions.delete(session.id);
      throw error;
    }

    return {
      verificationId: session.id,
    };
  }

  /**
   * Проверка кода подтверждения
   */
  async verify(verificationId: string, code: string) {
    const session = await this.sessions.findOne({
      where: { id: verificationId },
    });

    if (!session) {
      throw new BadRequestException("Сессия подтверждения не найдена");
    }

    if (session.status !== VerificationStatus.PENDING) {
      throw new BadRequestException("Сессия недействительна");
    }

    if (session.expiresAt.getTime() < Date.now()) {
      session.status = VerificationStatus.LOCKED;
      await this.sessions.save(session);
      throw new BadRequestException("Код истёк");
    }

    const incomingHash = hashVerificationCode(code);

    if (incomingHash !== session.codeHash) {
      session.attemptsLeft -= 1;

      if (session.attemptsLeft <= 0) {
        session.status = VerificationStatus.LOCKED;
      }

      await this.sessions.save(session);
      throw new BadRequestException("Неверный код");
    }

    session.status = VerificationStatus.USED;

    await this.sessions.save(session);

    return { userId: session.userId };
  }

  /**
   * Повторная отправка кода
   */
  async resend(oldSession: VerificationSession, email: string) {
    if (oldSession.status !== VerificationStatus.PENDING) {
      throw new BadRequestException("Сессия недействительна");
    }

    if (oldSession.expiresAt.getTime() < Date.now()) {
      oldSession.status = VerificationStatus.LOCKED;
      await this.sessions.save(oldSession);
      throw new BadRequestException("Код истёк");
    }

    if (oldSession.resendCount >= 3) {
      throw new BadRequestException("Превышен лимит повторных отправок");
    }

    // Создаём новую
    const code = generateVerificationCode();

    const newSession = await this.sessions.save({
      userId: oldSession.userId,
      codeHash: hashVerificationCode(code),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      attemptsLeft: 5,
      status: VerificationStatus.PENDING,
      resendCount: oldSession.resendCount + 1,
      lastSentAt: new Date(),
    });

    try {
      await this.emailService.sendVerificationCode(email, code);
    } catch (error) {
      await this.sessions.delete(newSession.id);
      throw error;
    }

    // Закрываем старую сессию
    oldSession.status = VerificationStatus.EXPIRED;
    await this.sessions.save(oldSession);

    return {
      verificationId: newSession.id,
    };
  }

}