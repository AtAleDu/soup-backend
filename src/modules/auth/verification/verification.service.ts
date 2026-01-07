import {
  Injectable,
  BadRequestException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import {
  VerificationSession,
  VerificationStatus,
} from '@entities/VerificationSession/verification-session.entity'
import {
  User,
  UserStatus,
} from '@entities/User/user.entity'

import {
  generateVerificationCode,
  hashVerificationCode,
} from './verification.util'

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(VerificationSession)
    private readonly sessions: Repository<VerificationSession>,

    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  /**
   * Создание новой verification-сессии (при регистрации)
   */
  async create(userId: string) {
    const code = generateVerificationCode()

    const session = await this.sessions.save({
      userId,
      codeHash: hashVerificationCode(code),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attemptsLeft: 5,
      status: VerificationStatus.PENDING,
      resendCount: 0,
      lastSentAt: new Date(),
    })

    // TODO: заменить на email / sms
    console.log('VERIFICATION CODE:', code)

    return {
      verificationId: session.id,
    }
  }

  /**
   * Проверка кода подтверждения
   */
  async verify(verificationId: string, code: string) {
    const session = await this.sessions.findOne({
      where: { id: verificationId },
    })

    if (!session) {
      throw new BadRequestException('Сессия подтверждения не найдена')
    }

    if (session.status !== VerificationStatus.PENDING) {
      throw new BadRequestException('Сессия недействительна')
    }

    if (session.expiresAt.getTime() < Date.now()) {
      session.status = VerificationStatus.LOCKED
      await this.sessions.save(session)
      throw new BadRequestException('Код истёк')
    }

    const incomingHash = hashVerificationCode(code)

    if (incomingHash !== session.codeHash) {
      session.attemptsLeft -= 1

      if (session.attemptsLeft <= 0) {
        session.status = VerificationStatus.LOCKED
      }

      await this.sessions.save(session)
      throw new BadRequestException('Неверный код')
    }

    const user = await this.users.findOne({
      where: { id: session.userId },
    })

    if (!user) {
      throw new BadRequestException('Пользователь не найден')
    }

    user.status = UserStatus.ACTIVE
    session.status = VerificationStatus.USED

    await this.users.save(user)
    await this.sessions.save(session)

    return { success: true }
  }

  /**
   * Повторная отправка кода
   */
  async resend(verificationId: string) {
    const oldSession = await this.sessions.findOne({
      where: { id: verificationId },
    })

    if (!oldSession) {
      throw new BadRequestException('Сессия не найдена')
    }

    if (oldSession.status !== VerificationStatus.PENDING) {
      throw new BadRequestException('Сессия недействительна')
    }

    if (oldSession.resendCount >= 3) {
      throw new BadRequestException('Превышен лимит повторных отправок')
    }

    if (
      oldSession.lastSentAt &&
      Date.now() - oldSession.lastSentAt.getTime() < 60_000
    ) {
      throw new BadRequestException('Подождите перед повторной отправкой')
    }

    // Закрываем старую сессию
    oldSession.status = VerificationStatus.EXPIRED
    await this.sessions.save(oldSession)

    // Создаём новую
    const code = generateVerificationCode()

    const newSession = await this.sessions.save({
      userId: oldSession.userId,
      codeHash: hashVerificationCode(code),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attemptsLeft: 5,
      status: VerificationStatus.PENDING,
      resendCount: oldSession.resendCount + 1,
      lastSentAt: new Date(),
    })

    // TODO: заменить на email / sms
    console.log('RESEND VERIFICATION CODE:', code)

    return {
      verificationId: newSession.id,
    }
  }
}
