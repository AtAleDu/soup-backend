import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Tariff } from "../Tarif/tariff.entity";

export enum UserRole {
  СOMPANY = "company",
  CLIENT = "client",
}

export enum UserStatus {
  PENDING = "pending",
  ACTIVE = "active",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.СOMPANY,
  })
  role: UserRole;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Column({ nullable: true })
  refreshTokenHash: string | null;

  @ManyToOne(() => Tariff, (tariff) => tariff.users, { nullable: true })
  tariff: Tariff | null;

  @Column({ type: "timestamp", nullable: true })
  tariffStartAt: Date | null;

  @Column({ type: "timestamp", nullable: true })
  tariffEndAt: Date | null;
}
