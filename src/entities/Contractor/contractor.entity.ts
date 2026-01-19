import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('contractor')
export class ContractorTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  title: string

  // Бейджи редактируют админы, дальше используются везде
  @Column('text', { array: true })
  badges: string[]
}
