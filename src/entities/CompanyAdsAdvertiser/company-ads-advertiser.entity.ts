import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Company } from "@entities/Company/company.entity";

@Entity("company_ads_advertiser")
export class CompanyAdsAdvertiser {
  @PrimaryColumn({ name: "company_id", type: "int" })
  companyId: number;

  @OneToOne(() => Company, { onDelete: "CASCADE" })
  @JoinColumn({ name: "company_id" })
  company: Company;

  @Column({ type: "jsonb" })
  data: {
    inn: string;
    kpp: string;
    shortName: string;
    fullName: string;
    phone: string;
    email: string;
    postalAddress: string;
    postalCode: string;
    legalAddress: string;
  };
}
