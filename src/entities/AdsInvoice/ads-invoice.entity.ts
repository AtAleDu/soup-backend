import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from "typeorm";
import { Company } from "@entities/Company/company.entity";
import { AdsInvoiceStatus } from "./ads-invoice-status.enum";
import type { AdsInvoiceStatusValue } from "./ads-invoice-status.enum";

@Entity("ads_invoices")
@Index(["companyId", "createdAt"])
@Index(["status"])
export class AdsInvoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "company_id", type: "int" })
  companyId: number;

  @ManyToOne(() => Company, { onDelete: "CASCADE" })
  @JoinColumn({ name: "company_id" })
  company: Company;

  @Column({ name: "advertiser_data", type: "jsonb" })
  advertiserData: Record<string, unknown>;

  @Column({ name: "cart_snapshot", type: "jsonb" })
  cartSnapshot: Record<string, unknown>;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  total: string;

  @Column({ name: "invoice_number", type: "varchar", unique: true })
  invoiceNumber: string;

  @Column({ type: "varchar", default: AdsInvoiceStatus.MODERATION })
  status: AdsInvoiceStatusValue;

  @Column({ name: "pdf_url", type: "varchar" })
  pdfUrl: string;

  @Column({ name: "paid_at", type: "timestamptz", nullable: true })
  paidAt: Date | null;

  @Column({ name: "approved_at", type: "timestamptz", nullable: true })
  approvedAt: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
