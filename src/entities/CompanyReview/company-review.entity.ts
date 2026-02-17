import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Company } from "@entities/Company/company.entity";
import { User } from "@entities/User/user.entity";
import { CompanyReviewReply } from "@entities/CompanyReviewReply/company-review-reply.entity";

@Entity("company_reviews")
export class CompanyReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "order_id", type: "bigint", unique: true, nullable: true })
  orderId: string | null;

  @Column({ name: "company_id", type: "int" })
  companyId: number;

  @Column({ name: "author_id", type: "uuid" })
  authorId: string;

  @Column({ name: "service_id", type: "bigint", nullable: true })
  serviceId: string | null;

  @Column({ name: "service_name", type: "text", nullable: true })
  serviceName: string | null;

  @Column({ type: "smallint" })
  rating: number;

  @Column({ type: "text", nullable: true })
  comment: string | null;

  @ManyToOne(() => Company, { onDelete: "CASCADE" })
  @JoinColumn({ name: "company_id" })
  company: Company;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "author_id" })
  author: User;

  @OneToOne(() => CompanyReviewReply, (reply) => reply.review)
  reply: CompanyReviewReply | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @Column({ name: "image_urls", type: "jsonb", nullable: true })
  imageUrls: string[] | null;
}
