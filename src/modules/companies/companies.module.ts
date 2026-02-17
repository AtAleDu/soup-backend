import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Company } from "@entities/Company/company.entity";
import { CompanyService } from "@entities/CompanyService/company-service.entity";
import { CompanyReview } from "@entities/CompanyReview/company-review.entity";
import { CompanyReviewReply } from "@entities/CompanyReviewReply/company-review-reply.entity";
import { Client } from "@entities/Client/client.entity";
import { StorageModule } from "@infrastructure/storage/storage.module";
import { RolesGuard } from "@modules/auth/guards/roles.guard";
import { CompaniesController } from "./companies.controller";
import { CompaniesService } from "./companies.service";
import { CompanyReviewsController } from "./company-reviews.controller";
import { CompanyReviewsService } from "./company-reviews.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      CompanyService,
      CompanyReview,
      CompanyReviewReply,
      Client,
    ]),
    StorageModule,
  ],
  controllers: [CompanyReviewsController, CompaniesController],
  providers: [CompaniesService, CompanyReviewsService, RolesGuard],
})
export class CompaniesModule {}
