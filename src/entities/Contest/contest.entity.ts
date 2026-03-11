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

  @Column({ type: "boolean", default: false })
  isAds: boolean;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  prizeFund?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  organizer?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  participationCost?: string;
}