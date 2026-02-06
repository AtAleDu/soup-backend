import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { User } from "../User/user.entity";

@Entity("tariffs")
export class Tariff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column("numeric")
  price: number;

  @Column({ type: "int", nullable: true })
  duration_days: number | null;

  @Column({ type: "jsonb", nullable: true })
  features: any;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => User, (user) => user.tariff)
  users: User[];
}
