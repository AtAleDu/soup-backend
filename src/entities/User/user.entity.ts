import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum UserRole {
  DOER = "doer",
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
    default: UserRole.DOER,
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
}
