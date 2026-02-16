import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { ContractorSubcategoryEntity } from './contractor-subcategory.entity'

@Entity('contractors_categories')
export class ContractorTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  title: string

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string | null

  @OneToMany(() => ContractorSubcategoryEntity, (subcategory) => subcategory.category, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  subcategories: ContractorSubcategoryEntity[]
}
