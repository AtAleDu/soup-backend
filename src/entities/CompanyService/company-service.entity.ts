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

  @Column()
  service: string;

  @Column({ name: "category_name" })
  categoryName: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
