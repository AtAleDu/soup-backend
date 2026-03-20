import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Ad } from './ad.entity'

@Entity('ad_clicks')
@Index(['adId'])
@Index(['createdAt'])
export class AdClick {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'ad_id', type: 'int' })
  adId: number

  @ManyToOne(() => Ad, (ad) => ad.clicks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ad_id' })
  ad: Ad

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}

