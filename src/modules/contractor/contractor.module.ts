import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ContractorTypeEntity } from '@entities/Contractor/contractor-type.entity'
import { ContractorService } from './contractor.service'
import { ContractorController } from './contractor.controller'
import { ContractorAdminController } from './admin/contractor.admin.controller'

@Module({
  imports: [TypeOrmModule.forFeature([ContractorTypeEntity])],
  controllers: [ContractorController, ContractorAdminController],
  providers: [ContractorService],
})
export class ContractorModule {}
