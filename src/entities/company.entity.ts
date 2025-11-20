import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Tariff } from './tariff.entity';
import { Article } from './article.entity';
import { Ad } from './ad.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password_hash: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  activity_type: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ type: 'jsonb', nullable: true })
  social_links: any;

  @Column({ default: false })
  is_verified: boolean;

  @ManyToOne(() => Tariff, (tariff) => tariff.companies)
  tariff: Tariff;

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  @OneToMany(() => Ad, (ad) => ad.company)
  ads: Ad[];
}
