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

@Entity("orders")
@Index(["companyId", "status", "createdAt"])
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "company_id", type: "int" })
  companyId: number;

  @ManyToOne(() => Company, { onDelete: "CASCADE" })
  @JoinColumn({ name: "company_id" })
  company: Company;

  @Column({ type: "varchar" })
  title: string;

  @Column({ name: "region", type: "varchar" })
  region: string;

  @Column({ type: "int" })
  price: number;

  @Column({ type: "varchar", nullable: true })
  category: string | null;

  @Column({ type: "varchar" })
  status: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
