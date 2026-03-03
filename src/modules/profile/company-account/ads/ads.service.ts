import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '@entities/User/user.entity'
import { Tariff } from '@entities/Tarif/tariff.entity'
import { AdPosition } from '@entities/Ad/ad-position.entity'

const DEFAULT_TARIFF_NAME = 'basic'

@Injectable()
export class CompanyAdsService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Tariff)
    private readonly tariffs: Repository<Tariff>,
    @InjectRepository(AdPosition)
    private readonly adPositions: Repository<AdPosition>,
  ) {}

  private async getUserById(userId: string) {
    const user = await this.users.findOne({
      where: { id: userId },
      relations: ['tariff'],
    })
    if (!user) throw new NotFoundException('Пользователь не найден')
    return user
  }

  private mapTariff(tariff: Tariff | null) {
    if (!tariff) return null
    return {
      id: tariff.id,
      name: tariff.name,
      price: Number(tariff.price),
      durationDays: tariff.duration_days ?? null,
      features: tariff.features ?? null,
    }
  }

  private mapAdPosition(position: AdPosition) {
    return {
      id: position.id,
      code: position.code,
      title: position.title,
      description: position.description,
      sortOrder: position.sort_order,
    }
  }

  private async getDefaultTariff() {
    return this.tariffs.findOne({
      where: { name: DEFAULT_TARIFF_NAME },
    })
  }

  private async downgradeUserToDefaultTariff(user: User, fallback: Tariff) {
    user.tariff = fallback
    user.tariffStartAt = new Date()

    if (fallback.duration_days != null) {
      user.tariffEndAt = new Date(
        user.tariffStartAt.getTime() + fallback.duration_days * 24 * 60 * 60 * 1000,
      )
    } else {
      user.tariffEndAt = null
    }

    await this.users.save(user)
    return fallback
  }

  private async ensureUserTariff(user: User) {
    return (async () => {
      let currentTariff = user.tariff ?? null
      const now = Date.now()

      if (
        currentTariff &&
        currentTariff.name !== DEFAULT_TARIFF_NAME &&
        user.tariffEndAt &&
        user.tariffEndAt.getTime() <= now
      ) {
        const fallback = await this.getDefaultTariff()
        if (fallback) {
          currentTariff = await this.downgradeUserToDefaultTariff(user, fallback)
        }
      }

      if (!currentTariff) {
        const fallback = await this.getDefaultTariff()
        if (fallback) {
          currentTariff = await this.downgradeUserToDefaultTariff(user, fallback)
        }
      }
      return currentTariff
    })()
  }

  private resolveDaysLeft(user: User) {
    if (!user.tariffEndAt) return null
    return Math.max(
      0,
      Math.ceil(
        (user.tariffEndAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000),
      ),
    )
  }

  async getCompanyTariffs(userId: string) {
    const user = await this.getUserById(userId)
    const tariffs = await this.tariffs.find({
      where: { is_active: true },
      order: { price: 'ASC' },
    })

    await this.ensureUserTariff(user)

    return {
      tariffs: tariffs.map((tariff) => this.mapTariff(tariff)!),
    }
  }

  async getCurrentTariff(userId: string) {
    const user = await this.getUserById(userId)
    const currentTariff = await this.ensureUserTariff(user)

    return {
      currentTariff: this.mapTariff(currentTariff),
      daysLeft: this.resolveDaysLeft(user),
    }
  }

  async getAdPositions() {
    const positions = await this.adPositions.find({
      where: { is_active: true },
      order: { sort_order: 'ASC', id: 'ASC' },
    })

    return {
      positions: positions.map((position) => this.mapAdPosition(position)),
    }
  }

  async downgradeExpiredTariffsBatch() {
    const fallback = await this.getDefaultTariff()
    if (!fallback) return { affected: 0 }

    const params: Array<number | string> = [fallback.id, 'company']
    const tariffEndAtSql =
      fallback.duration_days != null
        ? `NOW() + ($3::int * INTERVAL '1 day')`
        : `NULL`

    if (fallback.duration_days != null) {
      params.push(fallback.duration_days)
    }

    const result = await this.users.query(
      `
        UPDATE users
        SET
          "tariffId" = $1,
          "tariffStartAt" = NOW(),
          "tariffEndAt" = ${tariffEndAtSql}
        WHERE "tariffEndAt" IS NOT NULL
          AND "tariffEndAt" <= NOW()
          AND "tariffId" IS NOT NULL
          AND "role" = $2
          AND "tariffId" <> $1
      `,
      params,
    )

    return { affected: typeof result?.rowCount === 'number' ? result.rowCount : 0 }
  }
}
