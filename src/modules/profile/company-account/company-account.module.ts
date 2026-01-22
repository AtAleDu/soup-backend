import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Company } from '@entities/Company/company.entity'
import { CompanyAccountController } from './company-account.controller'
import { CompanyAccountService } from './company-account.service'

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  controllers: [CompanyAccountController],
  providers: [CompanyAccountService],
})
export class CompanyAccountModule {}
