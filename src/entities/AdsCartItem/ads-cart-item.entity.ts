import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { AdsCart } from '@entities/AdsCart/ads-cart.entity'
import { AdPosition } from '@entities/Ad/ad-position.entity'
import { Tariff } from '@entities/Tarif/tariff.entity'
import { AdsCartItemType } from './ads-cart-item-type.enum'
import type { AdsCartItemTypeValue } from './ads-cart-item-type.enum'

@Entity('ads_cart_items')
@Index(['cartId'])
@Index(['positionId'])
@Index(['tariffId'])
@Index(['cartId', 'itemType', 'positionId', 'periodDays'])
@Index(['cartId', 'itemType', 'tariffId'])
export class AdsCartItem {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'cart_id', type: 'int' })
  cartId: number

  @ManyToOne(() => AdsCart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: AdsCart

  @Column({ name: 'item_type', type: 'varchar', default: AdsCartItemType.POSITION })
  itemType: AdsCartItemTypeValue

  @Column({ name: 'position_id', type: 'int', nullable: true })
  positionId: number | null

  @ManyToOne(() => AdPosition, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'position_id' })
  position: AdPosition | null

  @Column({ name: 'tariff_id', type: 'int', nullable: true })
  tariffId: number | null

  @ManyToOne(() => Tariff, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'tariff_id' })
  tariff: Tariff | null

  @Column({ type: 'int', default: 1 })
  quantity: number

  @Column({ name: 'period_days', type: 'int' })
  periodDays: number

  @Column({ name: 'unit_price_snapshot', type: 'numeric', precision: 12, scale: 2 })
  unitPriceSnapshot: string

  @Column({ name: 'line_total', type: 'numeric', precision: 12, scale: 2 })
  lineTotal: string

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, unknown> | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
