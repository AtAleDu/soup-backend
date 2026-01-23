import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Company } from '@entities/Company/company.entity'
import { User } from '@entities/User/user.entity'
import { CompanyReview } from '@entities/CompanyReview/company-review.entity'
import { CompanyReviewReply } from '@entities/CompanyReviewReply/company-review-reply.entity'
import { Order } from '@entities/Order/order.entity'
import {
  EditCompanyAccountController,
  EditCompanyAccountService,
} from './edit-account'
import { CompanyReviewsController, CompanyReviewsService } from './reviews'
import { CompanyOrdersController, CompanyOrdersService } from './orders'

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, User, CompanyReview, CompanyReviewReply, Order]),
  ],
  controllers: [EditCompanyAccountController, CompanyReviewsController, CompanyOrdersController],
  providers: [EditCompanyAccountService, CompanyReviewsService, CompanyOrdersService],
})
export class CompanyAccountModule {}
