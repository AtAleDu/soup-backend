import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Company } from "@entities/Company/company.entity";

export enum BlogStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
}

@Entity("blogs")
export class Blog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "company_id", type: "int" })
  companyId: number;

  @ManyToOne(() => Company, (company) => company.blogs, { onDelete: "CASCADE" })
  @JoinColumn({ name: "company_id" })
  company: Company;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ name: "image_url", type: "varchar" })
  imageUrl: string;

  @Column({ name: "content_blocks", type: "jsonb", nullable: true })
  contentBlocks: unknown[] | null;

  @Column({
    type: "enum",
    enum: BlogStatus,
    default: BlogStatus.DRAFT,
  })
  status: BlogStatus;

  @Column({ name: "is_pinned", type: "boolean", default: false })
  isPinned: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;
}