import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { Company } from "@entities/Company/company.entity";
import { CompanyServiceStatus } from "./company-service-status.enum";

@Entity("company_services")
@Index(["companyId", "category"])
export class CompanyService {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "company_id", type: "int" })
  companyId: number;

  @ManyToOne(() => Company, { onDelete: "CASCADE" })
  @JoinColumn({ name: "company_id" })
  company: Company;

  @Column()
  category: string;

  @Column({ name: "category_description", type: "varchar", length: 500, nullable: true })
  categoryDescription: string | null;

  @Column()
  service: string;

  @Column("text", { array: true, name: "image_urls", default: [] })
  imageUrls: string[];

  @Column({
    type: "enum",
    enum: CompanyServiceStatus,
    default: CompanyServiceStatus.MODERATION,
  })
  status: CompanyServiceStatus;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
