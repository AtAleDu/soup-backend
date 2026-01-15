import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

export enum VerificationStatus {
  PENDING = "pending",
  LOCKED = "locked",
  USED = "used",
  EXPIRED = "expired",
}

@Entity("verification_sessions")
export class VerificationSession {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "uuid" })
  userId: string;

  @Column()
  codeHash: string;

  @Column({ type: "timestamptz" })
  expiresAt: Date;

  @Column({ default: 5 })
  attemptsLeft: number;

  @Column({
    type: "enum",
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  @Column({ type: "timestamptz", nullable: true })
  lastSentAt: Date | null;

  @Column({ default: 0 })
  resendCount: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
