import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Article } from "../Article/article.entity";
import { Ad } from "../Ad/ad.entity";
import { Tariff } from "../Tarif/tariff.entity";
import { User } from "../User/user.entity";

@Entity("companies")
export class Company {
  @PrimaryGeneratedColumn()
  companyId: number;

  @Column({ name: "user_id", type: "uuid", unique: true, nullable: true })
  userId: string | null;

  @OneToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User | null;

  @Column({ nullable: true })
  logo_url: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: "jsonb", nullable: true })
  regions: string[] | null;

  @Column({ type: "jsonb", nullable: true })
  social_links: any;

  @Column({ nullable: true })
  address: string;

  @Column({ type: "jsonb", nullable: true })
  phones: { phone: string; representativeName?: string | null }[] | null;

  @Column({ type: "jsonb", nullable: true })
  emails: string[] | null;

  @Column({ nullable: true })
  email: string;

  @ManyToOne(() => Tariff, (tariff) => tariff.companies)
  tariff: Tariff;

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  @OneToMany(() => Ad, (ad) => ad.company)
  ads: Ad[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
