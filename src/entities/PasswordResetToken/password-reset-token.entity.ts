import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity("password_reset_tokens")
export class PasswordResetToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "uuid" })
  userId: string;

  @Index()
  @Column()
  tokenHash: string;

  @Column({ type: "timestamptz" })
  expiresAt: Date;

  @Column({ type: "timestamptz", nullable: true })
  usedAt: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}