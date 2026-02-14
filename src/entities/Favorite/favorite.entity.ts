import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from "typeorm";
import { User } from "@entities/User/user.entity";
import { Company } from "@entities/Company/company.entity";

@Entity("user_favorites")
@Unique(["userId", "companyId"])
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "user_id", type: "uuid" })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "company_id", type: "int" })
  companyId: number;

  @ManyToOne(() => Company, { onDelete: "CASCADE" })
  @JoinColumn({ name: "company_id" })
  company: Company;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
