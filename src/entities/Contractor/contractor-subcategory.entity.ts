import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { ContractorTypeEntity } from './contractor-categories.entity'

@Entity('contractors_subcategories')
@Index('IDX_contractors_subcategories_category_id', ['categoryId'])
@Unique('UQ_contractors_subcategories_category_title', ['categoryId', 'title'])
export class ContractorSubcategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string

  @ManyToOne(() => ContractorTypeEntity, (category) => category.subcategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: ContractorTypeEntity

  @Column()
  title: string

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string | null

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null
}
