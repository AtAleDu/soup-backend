import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Company } from "../Company/company.entity";
import { AdPosition } from "./ad-position.entity";

@Entity("ads_banners")
export class AdBanner {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, (company) => company.adBanners, { onDelete: "CASCADE" })
  @JoinColumn({ name: "company_id" })
  company: Company;

  @ManyToOne(() => AdPosition, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "position_id" })
  position: AdPosition;

  @Column({ nullable: true })
  image_url: string | null;

  @Column({ nullable: true })
  link: string | null;

  @Column({ type: "date", nullable: true })
  start_date: string | null;

  @Column({ type: "date", nullable: true })
  end_date: string | null;

  @Column({ default: true })
  is_active: boolean;
}

