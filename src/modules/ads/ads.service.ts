import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Ad } from '@entities/Ad/ad.entity'
import { AdClick } from '@entities/Ad/ad-click.entity'
import { AdStatus } from '@entities/Ad/ad-status.enum'
import { StorageService } from '@infrastructure/storage/storage.service'
import { UPLOAD_IMAGE } from '@infrastructure/upload/upload-constraints'
import { GetAdsQueryDto } from './dto/get-ads-query.dto'
import { CreateAdminAdDto } from './dto/create-admin-ad.dto'
import { UpdateAdminAdDto } from './dto/update-admin-ad.dto'

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(Ad)
    private readonly ads: Repository<Ad>,
    @InjectRepository(AdClick)
    private readonly adClicks: Repository<AdClick>,
    private readonly storage: StorageService,
  ) {}

  private mapPublicAd(ad: Ad) {
    return {
      id: ad.id,
      adKind: ad.adKind,
      placement: ad.placement,
      sortOrder: ad.sortOrder,
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
    const limit = query.limit ?? 1
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

    const sortBy =
      query.sortBy === 'sort_order' || query.placement === 'main-page-banner'
        ? 'sort_order'
        : 'random'

    if (sortBy === 'sort_order') {
      qb.orderBy('ad.sort_order', 'ASC').addOrderBy('ad.id', 'ASC')
    } else {
      qb.orderBy('RANDOM()')
    }

    const items = await qb.limit(limit).getMany()
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
    await this.adClicks.insert({ adId: id, createdAt: new Date() })
    return ad.targetUrl
  }

  async getAdminList(status?: string, placement?: string) {
    const where: Partial<Ad> = {}

    if (status) {
      where.status = status as Ad['status']
    }

    if (placement) {
      where.placement = placement
    }

    const items = await this.ads.find({
      where: Object.keys(where).length > 0 ? where : undefined,
      order:
        placement === 'main-page-banner' ? { sortOrder: 'ASC', id: 'ASC' } : { id: 'DESC' },
    })
    return { items }
  }

  async createAdminAd(dto: CreateAdminAdDto) {
    const ad = this.ads.create({
      companyId: null,
      positionId: null,
      adKind: dto.adKind,
      placement: dto.placement,
      sortOrder: dto.sortOrder,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      imageUrl: dto.imageUrl.trim(),
      targetUrl: dto.targetUrl.trim(),
      payload: null,
      status: AdStatus.ACTIVE,
      startDate: dto.startDate ?? this.resolveTodayDate(),
      endDate: dto.endDate ?? null,
      clicksCount: 0,
      approvedAt: new Date(),
      rejectedReason: null,
      isActive: dto.isActive ?? true,
    })

    await this.ads.save(ad)
    return { ad }
  }

  async updateAdminAd(id: number, dto: UpdateAdminAdDto) {
    const ad = await this.ads.findOne({ where: { id } })
    if (!ad) {
      throw new NotFoundException('Реклама не найдена')
    }

    if (dto.adKind != null) ad.adKind = dto.adKind
    if (dto.placement != null) ad.placement = dto.placement
    if (dto.sortOrder != null) ad.sortOrder = dto.sortOrder
    if (dto.title != null) ad.title = dto.title.trim()
    if (dto.description !== undefined) ad.description = dto.description?.trim() || null
    if (dto.imageUrl != null) ad.imageUrl = dto.imageUrl.trim()
    if (dto.targetUrl != null) ad.targetUrl = dto.targetUrl.trim()
    if (dto.startDate !== undefined) ad.startDate = dto.startDate ?? null
    if (dto.endDate !== undefined) ad.endDate = dto.endDate ?? null
    if (dto.isActive != null) ad.isActive = dto.isActive

    if (ad.status !== AdStatus.ACTIVE) {
      ad.status = AdStatus.ACTIVE
      ad.approvedAt = new Date()
      ad.rejectedReason = null
    }

    await this.ads.save(ad)
    return { ad }
  }

  async toggleAdminAd(id: number) {
    const ad = await this.ads.findOne({ where: { id } })
    if (!ad) {
      throw new NotFoundException('Реклама не найдена')
    }

    ad.isActive = !ad.isActive
    await this.ads.save(ad)
    return { ad }
  }

  async deleteAdminAd(id: number) {
    const ad = await this.ads.findOne({ where: { id } })
    if (!ad) {
      throw new NotFoundException('Реклама не найдена')
    }

    await this.ads.remove(ad)
    return { deleted: true }
  }

  async uploadAdminAdImage(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file?.buffer) {
      throw new BadRequestException('Файл не передан')
    }

    if (!(UPLOAD_IMAGE.allowedMimeTypes as readonly string[]).includes(file.mimetype)) {
      throw new BadRequestException('Недопустимый формат. Разрешены: PNG, JPEG, WebP, SVG, HEIF')
    }

    if (file.size > UPLOAD_IMAGE.maxSizeBytes) {
      throw new BadRequestException('Размер файла превышает 5 МБ')
    }

    const ext = file.originalname?.match(/\.[a-z]+$/i)?.[0] ?? '.jpg'
    const uploadResult = await this.storage.upload(
      {
        buffer: file.buffer,
        mimeType: file.mimetype,
        size: file.size,
        originalName: `ads-admin-${Date.now()}${ext}`,
      },
      {
        allowedMimeTypes: [...UPLOAD_IMAGE.allowedMimeTypes],
        maxSizeBytes: UPLOAD_IMAGE.maxSizeBytes,
        isPublic: true,
        pathPrefix: 'ads/admin-images',
      },
    )

    return { url: uploadResult.url }
  }

  async approveAd(id: number) {
    const ad = await this.ads.findOne({ where: { id } })
    if (!ad) throw new NotFoundException('Реклама не найдена')

    ad.status = AdStatus.ACTIVE
    ad.approvedAt = new Date()
    ad.rejectedReason = null
    ad.startDate = ad.startDate ?? this.resolveTodayDate()
    ad.endDate = ad.endDate ?? this.resolveFutureDate(30)
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
