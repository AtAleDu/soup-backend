import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Company } from './company.entity';

@Entity('tariffs')
export class Tariff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('numeric')
  price: number;

  @Column()
  duration_days: number;

  @Column({ type: 'jsonb', nullable: true })
  features: any;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => Company, (company) => company.tariff)
  companies: Company[];
}
