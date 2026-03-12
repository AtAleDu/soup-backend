import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

export type NotificationContext = "client" | "company";

@Entity("notification_reads")
@Unique(["userId", "context", "notificationId"])
@Index(["userId", "context"])
export class NotificationRead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "user_id", type: "uuid" })
  userId: string;

  @Column({ type: "varchar", length: 20 })
  context: NotificationContext;

  @Column({ name: "notification_id", type: "varchar", length: 255 })
  notificationId: string;

  @CreateDateColumn({ name: "read_at" })
  readAt: Date;
}
