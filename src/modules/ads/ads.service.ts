import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Ad } from '@entities/Ad/ad.entity'
import { AdStatus } from '@entities/Ad/ad-status.enum'
import { GetAdsQueryDto } from './dto/get-ads-query.dto'

const DEFAULT_AD_LIMIT = 1
const DEFAULT_AD_APPROVAL_PERIOD_DAYS = 30

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(Ad)
    private readonly ads: Repository<Ad>,
  ) {}

  private mapPublicAd(ad: Ad) {
    return {
      id: ad.id,
      adKind: ad.adKind,
      placement: ad.placement,
      title: ad.title,
      description: ad.description,
      imageUrl: ad.imageUrl,
      targetUrl: ad.targetUrl,
      payload: ad.payload,
      clickUrl: `/ads/${ad.id}/click`,
    }
  }

  private resolveTodayDate() {
    return new Date().toISOString().slice(0, 10)
  }

  private resolveFutureDate(days: number) {
    const now = new Date()
    now.setDate(now.getDate() + days)
    return now.toISOString().slice(0, 10)
  }

  async getPublicAds(query: GetAdsQueryDto) {
    const limit = query.limit ?? DEFAULT_AD_LIMIT
    const qb = this.ads
      .createQueryBuilder('ad')
      .where('ad.status = :activeStatus', { activeStatus: AdStatus.ACTIVE })
      .andWhere('ad.is_active = true')
      .andWhere('(ad.start_date IS NULL OR ad.start_date <= CURRENT_DATE)')
      .andWhere('(ad.end_date IS NULL OR ad.end_date >= CURRENT_DATE)')

    if (query.placement) {
      qb.andWhere('ad.placement = :placement', { placement: query.placement })
    }

    if (query.adKind) {
      qb.andWhere('ad.ad_kind = :adKind', { adKind: query.adKind })
    }

    const items = await qb.orderBy('RANDOM()').limit(limit).getMany()
    return { items: items.map((ad) => this.mapPublicAd(ad)) }
  }

  async registerClickAndGetRedirectUrl(id: number) {
    const ad = await this.ads.findOne({
      where: {
        id,
        status: AdStatus.ACTIVE,
        isActive: true,
      },
    })
    if (!ad || !ad.targetUrl) {
      throw new NotFoundException('Реклама не найдена')
    }

    await this.ads.increment({ id }, 'clicksCount', 1)
    return ad.targetUrl
  }

  async getAdminList(status?: string) {
    const items = await this.ads.find({
      where: status ? { status: status as Ad['status'] } : undefined,
      order: { id: 'DESC' },
    })
    return { items }
  }

  async approveAd(id: number) {
    const ad = await this.ads.findOne({ where: { id } })
    if (!ad) throw new NotFoundException('Реклама не найдена')

    ad.status = AdStatus.ACTIVE
    ad.approvedAt = new Date()
    ad.rejectedReason = null
    ad.startDate = ad.startDate ?? this.resolveTodayDate()
    ad.endDate =
      ad.endDate ?? this.resolveFutureDate(DEFAULT_AD_APPROVAL_PERIOD_DAYS)
    await this.ads.save(ad)
    return { ad }
  }

  async rejectAd(id: number, reason?: string) {
    const ad = await this.ads.findOne({ where: { id } })
    if (!ad) throw new NotFoundException('Реклама не найдена')

    ad.status = AdStatus.REJECTED
    ad.rejectedReason = reason ?? null
    await this.ads.save(ad)
    return { ad }
  }
}
