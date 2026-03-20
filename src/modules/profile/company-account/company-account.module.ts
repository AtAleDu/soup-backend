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
import {
  AdminModerationServicesController,
  CompanyServicesController,
} from './services/company-services.controller'
import { CompanyServicesService } from './services/company-services.service'
import { CompanyService } from '@entities/CompanyService/company-service.entity'
import { ContractorTypeEntity } from '@entities/Contractor/contractor-categories.entity'
import { Tariff } from '@entities/Tarif/tariff.entity'
import { AdPosition } from '@entities/Ad/ad-position.entity'
import { Ad } from '@entities/Ad/ad.entity'
import { AdClick } from '@entities/Ad/ad-click.entity'
import { AdsExpirationScheduler, CompanyAdsController, CompanyAdsService } from './ads'
import { AdsCartModule } from './ads/cart/ads-cart.module'
import { OrderResponse } from '@entities/OrderResponse/order-response.entity'
import { Order } from '@entities/Order/order.entity'
import { OrderSuggestion } from '@entities/OrderSuggestion/order-suggestion.entity'
import { CompanyOrdersController, CompanyOrdersService } from './orders'
import { CompanyNotificationsController } from './notifications/company-notifications.controller'
import { CompanyNotificationsService } from './notifications/company-notifications.service'
import { NotificationRead } from '@entities/NotificationRead/notification-read.entity'
import { NotificationReadService } from '../notifications/notification-read.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      User,
      Blog,
      CompanyReview,
      CompanyReviewReply,
      CompanyService,
      ContractorTypeEntity,
      Tariff,
      AdPosition,
      Ad,
      AdClick,
      OrderResponse,
      Order,
      OrderSuggestion,
      NotificationRead,
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
    AdminModerationServicesController,
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
    NotificationReadService,
  ],
})
export class CompanyAccountModule {}
