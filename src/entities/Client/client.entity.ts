import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "@entities/User/user.entity";

type ClientContactType = "phone" | "email" | "telegram" | "max";

export type ClientContact = {
  type: ClientContactType;
  value: string;
};

export type ClientNotificationSettings = {
  sms: boolean;
  email: boolean;
};

export type ClientPrivacySettings = {
  phone: boolean;
  email: boolean;
  social_links: boolean;
};

@Entity("clients")
export class Client {
  @PrimaryGeneratedColumn()
  clientId: number;

  @Column({ name: "user_id", type: "uuid", unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "full_name", nullable: true })
  full_name: string | null;

  @Column({ nullable: true })
  city: string | null;

  @Column({ name: "avatar_url", nullable: true })
  avatar_url: string | null;

  @Column({ type: "jsonb", default: () => "'[]'::jsonb" })
  contacts: ClientContact[];

  @Column({
    name: "notification_settings",
    type: "jsonb",
    default: () => `'{"sms":false,"email":false}'::jsonb`,
  })
  notification_settings: ClientNotificationSettings;

  @Column({
    name: "privacy_settings",
    type: "jsonb",
    default: () => `'{"phone":false,"email":false,"social_links":false}'::jsonb`,
  })
  privacy_settings: ClientPrivacySettings;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
