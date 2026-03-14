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
import { Company } from '@entities/Company/company.entity'
import { AdPosition } from './ad-position.entity'
import { AdKind, type AdKindValue } from './ad-kind.enum'
import { AdStatus, type AdStatusValue } from './ad-status.enum'

@Entity('ads')
@Index(['companyId'])
@Index(['positionId'])
@Index(['placement'])
@Index(['sortOrder'])
@Index(['adKind'])
@Index(['status'])
@Index(['startDate'])
@Index(['endDate'])
export class Ad {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number | null

  @ManyToOne(() => Company, (company) => company.ads, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'company_id' })
  company: Company | null

  @Column({ name: 'position_id', type: 'int', nullable: true })
  positionId: number | null

  @ManyToOne(() => AdPosition, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'position_id' })
  position: AdPosition | null

  @Column({ name: 'ad_kind', type: 'varchar', default: AdKind.BANNER })
  adKind: AdKindValue

  @Column({ type: 'varchar', default: 'banner' })
  placement: string

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number

  @Column({ nullable: true })
  title: string | null

  @Column({ type: 'text', nullable: true })
  description: string | null

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string | null

  @Column({ name: 'target_url', nullable: true })
  targetUrl: string | null

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown> | null

  @Column({ type: 'varchar', default: AdStatus.DRAFT })
  status: AdStatusValue

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: string | null

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: string | null

  @Column({ name: 'clicks_count', type: 'int', default: 0 })
  clicksCount: number

  @Column({ name: 'approved_at', type: 'timestamp with time zone', nullable: true })
  approvedAt: Date | null

  @Column({ name: 'rejected_reason', type: 'text', nullable: true })
  rejectedReason: string | null

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
