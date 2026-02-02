import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Company } from "@entities/Company/company.entity";
import { CompanyService } from "@entities/CompanyService/company-service.entity";
import { CompaniesController } from "./companies.controller";
import { CompaniesService } from "./companies.service";

@Module({
  imports: [TypeOrmModule.forFeature([Company, CompanyService])],
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
