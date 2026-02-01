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

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, User, Blog, CompanyReview, CompanyReviewReply, Order]),
    RevalidationModule,
    StorageModule,
  ],
  controllers: [
    GetCompanyProfileController,
    EditCompanyAccountController,
    CompanyReviewsController,
    CompanyOrdersController,
    CompanyBlogController,
  ],
  providers: [
    EditCompanyAccountService,
    GetCompanyProfileService,
    CompanyReviewsService,
    CompanyOrdersService,
    CompanyBlogService,
  ],
})
export class CompanyAccountModule {}
