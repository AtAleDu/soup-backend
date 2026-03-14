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
import { Blog } from "../Blog/blog.entity";
import { User } from "../User/user.entity";
import { CompanyStatus } from "./company-status.enum";

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

  @Column({ nullable: true, length: 500 })
  description: string;

  @Column({ type: "jsonb", nullable: true })
  regions: string[] | null;

  @Column({ type: "jsonb", nullable: true })
  social_links: any;

  @Column({ nullable: true })
  address: string;

  @Column({ type: "jsonb", nullable: true })
  phones: { phone: string; representativeName?: string | null }[] | null;

  @Column({ nullable: true })
  email: string;

  @Column({
    type: "enum",
    enum: CompanyStatus,
    enumName: "companies_status_enum",
    default: CompanyStatus.PENDING,
  })
  status: CompanyStatus;

  @Column({
    name: "rejection_reason",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  rejectionReason: string | null;

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  @OneToMany(() => Ad, (ad) => ad.company)
  ads: Ad[];

  @OneToMany(() => Blog, (blog) => blog.company)
  blogs: Blog[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
