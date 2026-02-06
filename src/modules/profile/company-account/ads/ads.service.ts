import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '@entities/User/user.entity'
import { Tariff } from '@entities/Tarif/tariff.entity'

const DEFAULT_TARIFF_NAME = 'basic'

@Injectable()
export class CompanyAdsService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Tariff)
    private readonly tariffs: Repository<Tariff>,
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

  private ensureUserTariff(user: User) {
    return (async () => {
      let currentTariff = user.tariff ?? null
      if (!currentTariff) {
        const fallback = await this.tariffs.findOne({
          where: { name: DEFAULT_TARIFF_NAME },
        })
        if (fallback) {
          user.tariff = fallback
          if (!user.tariffStartAt) {
            user.tariffStartAt = new Date()
          }
          if (!user.tariffEndAt && fallback.duration_days != null) {
            user.tariffEndAt = new Date(
              user.tariffStartAt.getTime() +
                fallback.duration_days * 24 * 60 * 60 * 1000,
            )
          }
          await this.users.save(user)
          currentTariff = fallback
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
}
