import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Order } from "@entities/Order/order.entity";
import { Company } from "@entities/Company/company.entity";

@Entity("order_suggestions")
@Index(["orderId", "companyId"], { unique: true })
@Index(["companyId", "createdAt"])
export class OrderSuggestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "order_id", type: "int" })
  orderId: number;

  @ManyToOne(() => Order, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @Column({ name: "company_id", type: "int" })
  companyId: number;

  @ManyToOne(() => Company, { onDelete: "CASCADE" })
  @JoinColumn({ name: "company_id" })
  company: Company;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
