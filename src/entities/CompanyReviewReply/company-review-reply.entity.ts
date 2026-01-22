import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { CompanyReview } from "@entities/CompanyReview/company-review.entity";
import { Company } from "@entities/Company/company.entity";
import { User } from "@entities/User/user.entity";

@Entity("company_review_replies")
export class CompanyReviewReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "review_id", type: "int", unique: true })
  reviewId: number;

  @Column({ name: "company_id", type: "int" })
  companyId: number;

  @Column({ name: "author_id", type: "uuid" })
  authorId: string;

  @Column({ name: "reply_text", type: "text" })
  replyText: string;

  @OneToOne(() => CompanyReview, (review) => review.reply, { onDelete: "CASCADE" })
  @JoinColumn({ name: "review_id" })
  review: CompanyReview;

  @ManyToOne(() => Company, { onDelete: "CASCADE" })
  @JoinColumn({ name: "company_id" })
  company: Company;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "author_id" })
  author: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
