import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Company } from '@entities/Company/company.entity'
import { User } from '@entities/User/user.entity'
import { Blog } from '@entities/Blog/blog.entity'
import { CompanyReview } from '@entities/CompanyReview/company-review.entity'
import { CompanyReviewReply } from '@entities/CompanyReviewReply/company-review-reply.entity'
import { StorageModule } from '@infrastructure/storage/storage.module'
import { EditCompanyAccountController, EditCompanyAccountService } from './edit-account'
import { GetCompanyProfileController, GetCompanyProfileService } from './get-profile'
import { CompanyReviewsController, CompanyReviewsService } from './reviews'
import { CompanyBlogController, CompanyBlogService } from './blog'
import { CompanyServicesController } from './services/company-services.controller'
import { CompanyServicesService } from './services/company-services.service'
import { CompanyService } from '@entities/CompanyService/company-service.entity'
import { Tariff } from '@entities/Tarif/tariff.entity'
import { CompanyAdsController, CompanyAdsService } from './ads'
import { OrderResponse } from '@entities/OrderResponse/order-response.entity'
import { CompanyOrdersController, CompanyOrdersService } from './orders'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      User,
      Blog,
      CompanyReview,
      CompanyReviewReply,
      CompanyService,
      Tariff,
      OrderResponse,
    ]),
    StorageModule,
  ],
  controllers: [
    GetCompanyProfileController,
    EditCompanyAccountController,
    CompanyReviewsController,
    CompanyBlogController,
    CompanyServicesController,
    CompanyAdsController,
    CompanyOrdersController,
  ],
  providers: [
    EditCompanyAccountService,
    GetCompanyProfileService,
    CompanyReviewsService,
    CompanyBlogService,
    CompanyServicesService,
    CompanyAdsService,
    CompanyOrdersService,
  ],
})
export class CompanyAccountModule {}
