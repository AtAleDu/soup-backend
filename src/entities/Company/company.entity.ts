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
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: "is_email_confirmed", default: false })
  isEmailConfirmed: boolean;

  @Column({ nullable: true })
  currentHashedRefreshToken: string | null;

  @Column()
  name: string;

  @Column({ name: "user_id", type: "uuid", unique: true, nullable: true })
  userId: string | null;

  @OneToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User | null;

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

  @Column({ type: "jsonb", nullable: true })
  social_links: any;

  @Column({ default: false })
  is_verified: boolean;

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
