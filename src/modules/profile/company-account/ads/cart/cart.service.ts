import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Company } from '@entities/Company/company.entity'
import { AdPosition } from '@entities/Ad/ad-position.entity'
import { Tariff } from '@entities/Tarif/tariff.entity'
import { Ad } from '@entities/Ad/ad.entity'
import { AdKind } from '@entities/Ad/ad-kind.enum'
import { AdStatus } from '@entities/Ad/ad-status.enum'
import { AdsCart } from '@entities/AdsCart/ads-cart.entity'
import { AdsCartStatus } from '@entities/AdsCart/ads-cart-status.enum'
import { AdsCartItem } from '@entities/AdsCartItem/ads-cart-item.entity'
import { AdsCartItemType } from '@entities/AdsCartItem/ads-cart-item-type.enum'
import { AddAdsCartItemDto } from './dto/add-ads-cart-item.dto'
import { UpdateAdsCartItemDto } from './dto/update-ads-cart-item.dto'

const DEFAULT_CART_CURRENCY = 'RUB'
const DEFAULT_ADS_POSITION_PERIOD_DAYS = 30
const DEFAULT_ADS_POSITION_MONTH_PRICE = 5000
const MAX_BANNERS_PER_POSITION = 5
const AD_POSITION_MONTH_PRICE_BY_CODE: Record<string, number> = {
  banner: 5000,
}

@Injectable()
export class CompanyAdsCartService {
  constructor(
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(AdPosition)
    private readonly adPositions: Repository<AdPosition>,
    @InjectRepository(Tariff)
    private readonly tariffs: Repository<Tariff>,
    @InjectRepository(Ad)
    private readonly ads: Repository<Ad>,
    @InjectRepository(AdsCart)
    private readonly carts: Repository<AdsCart>,
    @InjectRepository(AdsCartItem)
    private readonly cartItems: Repository<AdsCartItem>,
  ) {}

  private async getCompanyByUserId(userId: string): Promise<Company> {
    const company = await this.companies.findOne({ where: { userId } })
    if (!company) {
      throw new NotFoundException('Компания не найдена')
    }
    return company
  }

  private toFixedMoney(value: number) {
    return value.toFixed(2)
  }

  private toNumber(value: number | string | null | undefined) {
    return Number(value ?? 0)
  }

  private resolveUnitPrice(position: AdPosition, periodDays: number) {
    const rawPrice = this.toNumber(position.price)
    const fallbackPrice =
      AD_POSITION_MONTH_PRICE_BY_CODE[position.code] ?? DEFAULT_ADS_POSITION_MONTH_PRICE
    const basePrice = rawPrice > 0 ? rawPrice : fallbackPrice
    const normalizedPeriod = periodDays / DEFAULT_ADS_POSITION_PERIOD_DAYS
    return basePrice * normalizedPeriod
  }

  private resolveTariffUnitPrice(tariff: Tariff) {
    return this.toNumber(tariff.price)
  }

  private resolveItemType(dto: AddAdsCartItemDto) {
    if (dto.itemType) return dto.itemType
    if (dto.tariffId) return AdsCartItemType.TARIFF
    return AdsCartItemType.POSITION
  }

  private async resolveCreatedBannersCount(companyId: number, positionId: number) {
    const count = await this.ads.count({
      where: {
        companyId,
        positionId,
        adKind: AdKind.BANNER,
        isActive: true,
      },
    })
    return count
  }

  private async moveCompanyDraftAdsToPendingReview(companyId: number, positionId: number) {
    const drafts = await this.ads.find({
      where: {
        companyId,
        positionId,
        adKind: AdKind.BANNER,
        status: AdStatus.DRAFT,
        isActive: true,
      },
      order: { id: 'DESC' },
      take: MAX_BANNERS_PER_POSITION,
    })

    if (!drafts.length) {
      return
    }

    for (const ad of drafts) {
      ad.status = AdStatus.PENDING_REVIEW
    }
    await this.ads.save(drafts)
  }

  private mapCartItem(item: AdsCartItem) {
    return {
      id: item.id,
      itemType: item.itemType,
      positionId: item.positionId,
      positionCode: item.position?.code ?? null,
      positionTitle: item.position?.title ?? null,
      tariffId: item.tariffId,
      tariffName: item.tariff?.name ?? null,
      quantity: item.quantity,
      periodDays: item.periodDays,
      unitPrice: this.toNumber(item.unitPriceSnapshot),
      lineTotal: this.toNumber(item.lineTotal),
      meta: item.meta,
    }
  }

  private mapCart(cart: AdsCart) {
    return {
      id: cart.id,
      status: cart.status,
      currency: cart.currency,
      subtotal: this.toNumber(cart.subtotal),
      total: this.toNumber(cart.total),
      version: cart.version,
      items: (cart.items ?? []).map((item) => this.mapCartItem(item)),
    }
  }

  private async loadCartWithItems(cartId: number) {
    const cart = await this.carts
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.items', 'item')
      .leftJoinAndSelect('item.position', 'position')
      .leftJoinAndSelect('item.tariff', 'tariff')
      .where('cart.id = :cartId', { cartId })
      .orderBy('item.created_at', 'ASC')
      .getOne()

    if (!cart) {
      throw new NotFoundException('Корзина не найдена')
    }
    return cart
  }

  private async getOrCreateActiveCart(companyId: number) {
    const existing = await this.carts.findOne({
      where: { companyId, status: AdsCartStatus.ACTIVE },
      order: { id: 'DESC' },
    })
    if (existing) return existing

    const cart = this.carts.create({
      companyId,
      status: AdsCartStatus.ACTIVE,
      currency: DEFAULT_CART_CURRENCY,
      subtotal: '0.00',
      total: '0.00',
      version: 1,
      expiresAt: null,
    })
    return this.carts.save(cart)
  }

  private async recalculateCartTotals(cartId: number) {
    const raw = await this.cartItems
      .createQueryBuilder('item')
      .select('COALESCE(SUM(item.line_total), 0)', 'subtotal')
      .where('item.cart_id = :cartId', { cartId })
      .getRawOne<{ subtotal: string }>()

    const subtotal = this.toNumber(raw?.subtotal)
    await this.carts.update(
      { id: cartId },
      {
        subtotal: this.toFixedMoney(subtotal),
        total: this.toFixedMoney(subtotal),
      },
    )
    await this.carts.increment({ id: cartId }, 'version', 1)
  }

  private async findActiveCartItemForCompany(companyId: number, itemId: number) {
    const item = await this.cartItems
      .createQueryBuilder('item')
      .innerJoinAndSelect('item.cart', 'cart')
      .leftJoinAndSelect('item.position', 'position')
      .leftJoinAndSelect('item.tariff', 'tariff')
      .where('item.id = :itemId', { itemId })
      .andWhere('cart.company_id = :companyId', { companyId })
      .andWhere('cart.status = :status', { status: AdsCartStatus.ACTIVE })
      .getOne()

    if (!item) {
      throw new NotFoundException('Позиция корзины не найдена')
    }
    return item
  }

  async getActiveCart(userId: string) {
    const company = await this.getCompanyByUserId(userId)
    const cart = await this.getOrCreateActiveCart(company.companyId)
    const fullCart = await this.loadCartWithItems(cart.id)

    return { cart: this.mapCart(fullCart) }
  }

  async addItemToCart(userId: string, dto: AddAdsCartItemDto) {
    const company = await this.getCompanyByUserId(userId)
    const cart = await this.getOrCreateActiveCart(company.companyId)
    const itemType = this.resolveItemType(dto)
    const quantity = dto.quantity ?? 1
    if (itemType === AdsCartItemType.TARIFF) {
      const tariffId = dto.tariffId
      if (!tariffId) {
        throw new BadRequestException('Не передан tariffId')
      }

      const tariff = await this.tariffs.findOne({
        where: { id: tariffId, is_active: true },
      })
      if (!tariff) {
        throw new NotFoundException('Тариф не найден')
      }

      const unitPrice = this.resolveTariffUnitPrice(tariff)
      const periodDays = tariff.duration_days ?? 1
      const existing = await this.cartItems.findOne({
        where: {
          cartId: cart.id,
          itemType: AdsCartItemType.TARIFF,
          tariffId: tariff.id,
        },
      })

      if (existing) {
        existing.quantity += quantity
        existing.unitPriceSnapshot = this.toFixedMoney(unitPrice)
        existing.periodDays = periodDays
        existing.lineTotal = this.toFixedMoney(existing.quantity * unitPrice)
        existing.meta = dto.meta ?? existing.meta
        await this.cartItems.save(existing)
      } else {
        const item = this.cartItems.create({
          cartId: cart.id,
          itemType: AdsCartItemType.TARIFF,
          positionId: null,
          tariffId: tariff.id,
          quantity,
          periodDays,
          unitPriceSnapshot: this.toFixedMoney(unitPrice),
          lineTotal: this.toFixedMoney(quantity * unitPrice),
          meta: dto.meta ?? null,
        })
        await this.cartItems.save(item)
      }
    } else {
      const positionId = dto.positionId
      const periodDays = dto.periodDays
      if (!positionId || !periodDays) {
        throw new BadRequestException('Для позиции нужны positionId и periodDays')
      }

      const position = await this.adPositions.findOne({
        where: { id: positionId, is_active: true },
      })
      if (!position) {
        throw new NotFoundException('Рекламная позиция не найдена')
      }

      const createdBannersCount = await this.resolveCreatedBannersCount(
        company.companyId,
        position.id,
      )
      if (createdBannersCount < 1) {
        throw new BadRequestException(
          'Сначала создайте хотя бы один баннер для выбранной позиции',
        )
      }
      if (createdBannersCount > MAX_BANNERS_PER_POSITION) {
        throw new BadRequestException(
          `Для позиции можно использовать максимум ${MAX_BANNERS_PER_POSITION} баннеров`,
        )
      }

      const unitPrice = this.resolveUnitPrice(position, periodDays)
      const existing = await this.cartItems.findOne({
        where: {
          cartId: cart.id,
          itemType: AdsCartItemType.POSITION,
          positionId: position.id,
        },
      })

      if (existing) {
        existing.quantity = 1
        existing.periodDays = periodDays
        existing.unitPriceSnapshot = this.toFixedMoney(unitPrice)
        existing.lineTotal = this.toFixedMoney(unitPrice)
        existing.meta = dto.meta ?? existing.meta
        await this.cartItems.save(existing)
      } else {
        const item = this.cartItems.create({
          cartId: cart.id,
          itemType: AdsCartItemType.POSITION,
          positionId: position.id,
          tariffId: null,
          quantity: 1,
          periodDays,
          unitPriceSnapshot: this.toFixedMoney(unitPrice),
          lineTotal: this.toFixedMoney(unitPrice),
          meta: dto.meta ?? null,
        })
        await this.cartItems.save(item)
      }
    }

    await this.recalculateCartTotals(cart.id)
    const fullCart = await this.loadCartWithItems(cart.id)
    return { cart: this.mapCart(fullCart) }
  }

  async updateCartItem(userId: string, itemId: number, dto: UpdateAdsCartItemDto) {
    if (
      dto.quantity == null &&
      dto.periodDays == null &&
      dto.meta == null
    ) {
      throw new BadRequestException('Нет данных для обновления позиции корзины')
    }

    const company = await this.getCompanyByUserId(userId)
    const item = await this.findActiveCartItemForCompany(company.companyId, itemId)

    if (dto.quantity != null) {
      item.quantity = dto.quantity
    }
    if (dto.meta !== undefined) {
      item.meta = dto.meta
    }

    if (item.itemType === AdsCartItemType.TARIFF) {
      const tariff = item.tariff
      if (!tariff) {
        throw new NotFoundException('Тариф для позиции корзины не найден')
      }

      item.periodDays = tariff.duration_days ?? 1
      const unitPrice = this.resolveTariffUnitPrice(tariff)
      item.unitPriceSnapshot = this.toFixedMoney(unitPrice)
      item.lineTotal = this.toFixedMoney(item.quantity * unitPrice)
    } else {
      if (dto.periodDays != null) {
        item.periodDays = dto.periodDays
      }

      const position = item.position
      if (!position) {
        throw new NotFoundException('Позиция рекламы для корзины не найдена')
      }

      const unitPrice = this.resolveUnitPrice(position, item.periodDays)
      item.unitPriceSnapshot = this.toFixedMoney(unitPrice)
      item.lineTotal = this.toFixedMoney(item.quantity * unitPrice)
    }

    await this.cartItems.save(item)
    await this.recalculateCartTotals(item.cartId)

    const fullCart = await this.loadCartWithItems(item.cartId)
    return { cart: this.mapCart(fullCart) }
  }

  async removeCartItem(userId: string, itemId: number) {
    const company = await this.getCompanyByUserId(userId)
    const item = await this.findActiveCartItemForCompany(company.companyId, itemId)

    await this.cartItems.remove(item)
    await this.recalculateCartTotals(item.cartId)

    const fullCart = await this.loadCartWithItems(item.cartId)
    return { cart: this.mapCart(fullCart) }
  }

  async checkoutCart(userId: string) {
    const company = await this.getCompanyByUserId(userId)
    const cart = await this.getOrCreateActiveCart(company.companyId)
    const fullCart = await this.loadCartWithItems(cart.id)

    if (!fullCart.items?.length) {
      throw new BadRequestException('Корзина пуста')
    }

    const positionItems = fullCart.items.filter(
      (item) => item.itemType === AdsCartItemType.POSITION && item.positionId != null,
    )

    for (const item of positionItems) {
      await this.moveCompanyDraftAdsToPendingReview(company.companyId, item.positionId!)
    }

    await this.carts.update(
      { id: fullCart.id },
      { status: AdsCartStatus.CHECKED_OUT },
    )
    await this.carts.increment({ id: fullCart.id }, 'version', 1)

    const checkedOutCart = await this.loadCartWithItems(fullCart.id)
    return { cart: this.mapCart(checkedOutCart) }
  }
}
