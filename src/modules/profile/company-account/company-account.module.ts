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
import { AdPosition } from '@entities/Ad/ad-position.entity'
import { AdBanner } from '@entities/Ad/ad-banner.entity'
import { AdsExpirationScheduler, CompanyAdsController, CompanyAdsService } from './ads'
import { AdsCartModule } from './ads/cart/ads-cart.module'
import { OrderResponse } from '@entities/OrderResponse/order-response.entity'
import { CompanyOrdersController, CompanyOrdersService } from './orders'
import { CompanyNotificationsController } from './notifications/company-notifications.controller'
import { CompanyNotificationsService } from './notifications/company-notifications.service'

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
      AdPosition,
      AdBanner,
      OrderResponse,
    ]),
    StorageModule,
    AdsCartModule,
  ],
  controllers: [
    GetCompanyProfileController,
    EditCompanyAccountController,
    CompanyReviewsController,
    CompanyBlogController,
    CompanyNotificationsController,
    CompanyServicesController,
    CompanyAdsController,
    CompanyOrdersController,
  ],
  providers: [
    EditCompanyAccountService,
    GetCompanyProfileService,
    CompanyReviewsService,
    CompanyBlogService,
    CompanyNotificationsService,
    CompanyServicesService,
    CompanyAdsService,
    AdsExpirationScheduler,
    CompanyOrdersService,
  ],
})
export class CompanyAccountModule {}
