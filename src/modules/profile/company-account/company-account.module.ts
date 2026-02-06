import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Company } from '@entities/Company/company.entity'
import { User } from '@entities/User/user.entity'
import { Blog } from '@entities/Blog/blog.entity'
import { CompanyReview } from '@entities/CompanyReview/company-review.entity'
import { CompanyReviewReply } from '@entities/CompanyReviewReply/company-review-reply.entity'
import { Order } from '@entities/Order/order.entity'
import { RevalidationModule } from '@infrastructure/revalidation/revalidation.module'
import { StorageModule } from '@infrastructure/storage/storage.module'
import { EditCompanyAccountController, EditCompanyAccountService } from './edit-account'
import { GetCompanyProfileController, GetCompanyProfileService } from './get-profile'
import { CompanyReviewsController, CompanyReviewsService } from './reviews'
import { CompanyOrdersController, CompanyOrdersService } from './orders'
import { CompanyBlogController, CompanyBlogService } from './blog'
import { CompanyServicesController } from './services/company-services.controller'
import { CompanyServicesService } from './services/company-services.service'
import { CompanyService } from '@entities/CompanyService/company-service.entity'
import { Tariff } from '@entities/Tarif/tariff.entity'
import { CompanyAdsController, CompanyAdsService } from './ads'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      User,
      Blog,
      CompanyReview,
      CompanyReviewReply,
      Order,
      CompanyService,
      Tariff,
    ]),
    RevalidationModule,
    StorageModule,
  ],
  controllers: [
    GetCompanyProfileController,
    EditCompanyAccountController,
    CompanyReviewsController,
    CompanyOrdersController,
    CompanyBlogController,
    CompanyServicesController,
    CompanyAdsController,
  ],
  providers: [
    EditCompanyAccountService,
    GetCompanyProfileService,
    CompanyReviewsService,
    CompanyOrdersService,
    CompanyBlogService,
    CompanyServicesService,
    CompanyAdsService,
  ],
})
export class CompanyAccountModule {}
