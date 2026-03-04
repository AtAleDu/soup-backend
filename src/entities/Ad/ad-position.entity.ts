import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("ad_positions")
export class AdPosition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "numeric", precision: 12, scale: 2, default: 0 })
  price: string;

  @Column({ type: "int", default: 0 })
  sort_order: number;

  @Column({ default: true })
  is_active: boolean;
}

