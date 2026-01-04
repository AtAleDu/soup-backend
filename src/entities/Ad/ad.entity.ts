import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Company } from '../Company/company.entity';

@Entity('ads')
export class Ad {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, (company) => company.ads)
  company: Company;

  @Column()
  position: string; // banner | sidebar | catalog_featured

  @Column({ nullable: true })
  image_url: string;

  @Column({ nullable: true })
  link: string;

  @Column({ type: 'date', nullable: true })
  start_date: string;

  @Column({ type: 'date', nullable: true })
  end_date: string;

  @Column({ default: true })
  is_active: boolean;
}
