import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Company } from '@entities/Company/company.entity'
import { AdsCartItem } from '@entities/AdsCartItem/ads-cart-item.entity'
import { AdsCartStatus } from './ads-cart-status.enum'
import type { AdsCartStatusValue } from './ads-cart-status.enum'

@Entity('ads_carts')
@Index(['companyId', 'status'])
@Index(['expiresAt'])
export class AdsCart {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'company_id', type: 'int' })
  companyId: number

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company

  @Column({ type: 'varchar', default: AdsCartStatus.ACTIVE })
  status: AdsCartStatusValue

  @Column({ type: 'varchar', length: 3, default: 'RUB' })
  currency: string

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal: string

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total: string

  @Column({ type: 'int', default: 1 })
  version: number

  @Column({ name: 'expires_at', type: 'timestamp with time zone', nullable: true })
  expiresAt: Date | null

  @OneToMany(() => AdsCartItem, (item) => item.cart)
  items: AdsCartItem[]

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
