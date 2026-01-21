import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("contests")
export class Contest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: "text" })
  contestLink: string;

  @Column({ type: "date" })
  startDate: string;

  @Column({ type: "date" })
  endDate: string;

  @Column({ nullable: true })
  imageUrl?: string;
}