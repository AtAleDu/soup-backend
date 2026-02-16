import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ContractorTypeEntity } from '@entities/Contractor/contractor-categories.entity'
import { ContractorSubcategoryEntity } from '@entities/Contractor/contractor-subcategory.entity'
import { ContractorService } from './contractor.service'
import { ContractorController } from './contractor.controller'
import { ContractorAdminController } from './admin/contractor.admin.controller'

@Module({
  imports: [TypeOrmModule.forFeature([ContractorTypeEntity, ContractorSubcategoryEntity])],
  controllers: [ContractorController, ContractorAdminController],
  providers: [ContractorService],
})
export class ContractorModule { }
