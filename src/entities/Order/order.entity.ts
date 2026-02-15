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
import { Client } from "@entities/Client/client.entity";

export const OrderStatus = {
  ACTIVE: "active",
  COMPLETED: "completed",
  MODERATION: "moderation",
} as const;

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

@Entity("orders")
@Index(["clientId", "createdAt"])
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "client_id", type: "int" })
  clientId: number;

  @ManyToOne(() => Client, { onDelete: "CASCADE" })
  @JoinColumn({ name: "client_id" })
  client: Client;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "varchar", nullable: true })
  description: string | null;

  @Column({ name: "region", type: "varchar" })
  region: string;

  @Column({ type: "int" })
  price: number;

  @Column({ type: "varchar" })
  category: string;

  @Column({ type: "varchar", default: OrderStatus.ACTIVE })
  status: string;

  @Column({ type: "timestamp with time zone", nullable: true })
  deadline: Date | null;

  @Column({ name: "hide_phone", type: "boolean", default: false })
  hidePhone: boolean;

  @Column({ name: "file_urls", type: "jsonb", default: () => "'[]'::jsonb" })
  fileUrls: string[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
