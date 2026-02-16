import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Order } from "@entities/Order/order.entity";
import { Company } from "@entities/Company/company.entity";

export const OrderResponseStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

@Entity("order_responses")
@Index(["orderId", "companyId"], { unique: true })
@Index(["orderId", "createdAt"])
@Index(["companyId", "createdAt"])
export class OrderResponse {
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

  @Column({ type: "text", nullable: true })
  message: string | null;

  @Column({ name: "price_from", type: "int", nullable: true })
  priceFrom: number | null;

  @Column({ name: "price_to", type: "int", nullable: true })
  priceTo: number | null;

  @Column({ name: "price_offer", type: "int", nullable: true })
  priceOffer: number | null;

  @Column({ name: "deadline_offer", type: "timestamp with time zone", nullable: true })
  deadlineOffer: Date | null;

  @Column({ type: "varchar", default: OrderResponseStatus.PENDING })
  status: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
