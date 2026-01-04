import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Company } from '../Company/company.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  slug: string;

  @Column()
  content: string;

  @Column({ nullable: true })
  image_url: string;

  @ManyToOne(() => Company, (company) => company.articles)
  author: Company;
}
