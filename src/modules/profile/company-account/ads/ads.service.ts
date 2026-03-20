import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '@entities/User/user.entity'
import { Tariff } from '@entities/Tarif/tariff.entity'
import { AdPosition } from '@entities/Ad/ad-position.entity'
import { Company } from '@entities/Company/company.entity'
import { Ad } from '@entities/Ad/ad.entity'
import { AdClick } from '@entities/Ad/ad-click.entity'
import { AdKind } from '@entities/Ad/ad-kind.enum'
import type {
  CompanyAdsStatisticsResponseDto,
  CompanyAdsStatisticsRange,
} from './dto/company-ads-statistics.dto'

const DEFAULT_TARIFF_NAME = 'basic'
const DEFAULT_AD_POSITION_PRICE = 5000
const AD_POSITION_PRICE_BY_CODE: Record<string, number> = {
  banner: 5000,
}
const MAX_BANNERS_PER_POSITION = 5

@Injectable()
export class CompanyAdsService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Tariff)
    private readonly tariffs: Repository<Tariff>,
    @InjectRepository(AdPosition)
    private readonly adPositions: Repository<AdPosition>,
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(Ad)
    private readonly ads: Repository<Ad>,
    @InjectRepository(AdClick)
    private readonly adClicks: Repository<AdClick>,
  ) {}

  private resolveDateRange(range?: string, from?: string, to?: string) {
    const now = new Date()

    if (range === 'week') {
      const fromDate = new Date(now)
      fromDate.setDate(fromDate.getDate() - 7)
      return { fromDate, toDate: now }
    }

    if (range === 'month') {
      const fromDate = new Date(now)
      fromDate.setDate(fromDate.getDate() - 30)
      return { fromDate, toDate: now }
    }

    // period (fallback)
    const fromDate = from ? new Date(from) : (() => {
      const d = new Date(now)
      d.setDate(d.getDate() - 30)
      return d
    })()
    const toDate = to ? new Date(to) : now

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      const fallbackFrom = new Date(now)
      fallbackFrom.setDate(fallbackFrom.getDate() - 30)
      return { fromDate: fallbackFrom, toDate: now }
    }

    return { fromDate, toDate }
  }

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

  private mapAdPosition(
    position: AdPosition,
    createdBannersCount: number,
    previewBanners: Ad[],
  ) {
    const rawPrice = Number(position.price)
    const fallbackPrice =
      AD_POSITION_PRICE_BY_CODE[position.code] ?? DEFAULT_AD_POSITION_PRICE
    const price = rawPrice > 0 ? rawPrice : fallbackPrice

    return {
      id: position.id,
      code: position.code,
      title: position.title,
      description: position.description,
      price,
      sortOrder: position.sort_order,
      createdBannersCount,
      maxBanners: MAX_BANNERS_PER_POSITION,
      canAddToCart:
        createdBannersCount > 0 && createdBannersCount <= MAX_BANNERS_PER_POSITION,
      previewBanners: previewBanners.map((banner) => ({
        id: banner.id,
        imageUrl: banner.imageUrl,
        link: banner.targetUrl,
      })),
    }
  }

  private async getCompanyByUserId(userId: string) {
    const company = await this.companies.findOne({ where: { userId } })
    if (!company) throw new NotFoundException('Компания не найдена')
    return company
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

  async getAdPositions(userId: string) {
    const company = await this.getCompanyByUserId(userId)
    const positions = await this.adPositions.find({
      where: { is_active: true },
      order: { sort_order: 'ASC', id: 'ASC' },
    })
    const banners = await this.ads.find({
      where: {
        companyId: company.companyId,
        adKind: AdKind.BANNER,
        isActive: true,
      },
      relations: ['position'],
      order: { id: 'DESC' },
    })

    const bannersByPositionId = new Map<number, Ad[]>()
    for (const banner of banners) {
      const positionId = banner.positionId ?? banner.position?.id
      if (!positionId) continue
      const list = bannersByPositionId.get(positionId) ?? []
      list.push(banner)
      bannersByPositionId.set(positionId, list)
    }

    return {
      positions: positions.map((position) => {
        const positionBanners = bannersByPositionId.get(position.id) ?? []
        return this.mapAdPosition(
          position,
          positionBanners.length,
          positionBanners.slice(0, MAX_BANNERS_PER_POSITION),
        )
      }),
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

  async getAdsStatistics(
    userId: string,
    params: { range?: string; from?: string; to?: string },
  ): Promise<CompanyAdsStatisticsResponseDto> {
    const company = await this.getCompanyByUserId(userId)
    const { fromDate, toDate } = this.resolveDateRange(
      params.range as CompanyAdsStatisticsRange | undefined,
      params.from,
      params.to,
    )

    const baseQb = this.adClicks
      .createQueryBuilder('click')
      .innerJoin('click.ad', 'ad')
      .where('ad.companyId = :companyId', { companyId: company.companyId })
      .andWhere('click.createdAt >= :fromDate AND click.createdAt < :toDate', {
        fromDate,
        toDate,
      })

    const [sourcesRows, itemsRows, profileTransitions, bannerClicks, newsClicks, callClicks] =
      await Promise.all([
        baseQb
          .clone()
          .select('ad.placement', 'placement')
          .addSelect('COUNT(click.id)', 'clicksCount')
          .groupBy('ad.placement')
          .orderBy('COUNT(click.id)', 'DESC')
          .getRawMany<{ placement: string; clicksCount: string }>(),
        baseQb
          .clone()
          .select('ad.id', 'id')
          .addSelect('ad.title', 'title')
          .addSelect('ad.placement', 'placement')
          .addSelect('COUNT(click.id)', 'clicksCount')
          .groupBy('ad.id')
          .addGroupBy('ad.title')
          .addGroupBy('ad.placement')
          .orderBy('COUNT(click.id)', 'DESC')
          .limit(20)
          .getRawMany<{ id: number; title: string | null; placement: string | null; clicksCount: string }>(),
        baseQb
          .clone()
          .andWhere('ad.targetUrl LIKE :profilePattern', {
            profilePattern: `%catalog/company?id=${company.companyId}%`,
          })
          .select('COUNT(click.id)', 'count')
          .getRawOne<{ count: string }>(),
        baseQb
          .clone()
          .andWhere('ad.placement = :bannerPlacement', { bannerPlacement: 'banner' })
          .select('COUNT(click.id)', 'count')
          .getRawOne<{ count: string }>(),
        baseQb
          .clone()
          .andWhere('ad.placement ILIKE :newsPattern', { newsPattern: '%news%' })
          .select('COUNT(click.id)', 'count')
          .getRawOne<{ count: string }>(),
        baseQb
          .clone()
          .andWhere('ad.targetUrl ILIKE :telPattern', { telPattern: 'tel:%' })
          .select('COUNT(click.id)', 'count')
          .getRawOne<{ count: string }>(),
      ])

    const toNum = (value: string | null | undefined) => Number(value ?? 0)

    return {
      summary: {
        profileTransitions: toNum(profileTransitions?.count),
        bannerClicks: toNum(bannerClicks?.count),
        newsClicks: toNum(newsClicks?.count),
        callClicks: toNum(callClicks?.count),
      },
      sources: (sourcesRows ?? []).map((row) => ({
        placement: row.placement,
        clicksCount: toNum(row.clicksCount),
      })),
      items: (itemsRows ?? []).map((row) => ({
        id: Number(row.id),
        title: row.title ?? null,
        placement: row.placement ?? null,
        clicksCount: toNum(row.clicksCount),
      })),
    }
  }
}
