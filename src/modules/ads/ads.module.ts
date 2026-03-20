import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Ad } from '@entities/Ad/ad.entity'
import { AdClick } from '@entities/Ad/ad-click.entity'
import { StorageModule } from '@infrastructure/storage/storage.module'
import { AdsService } from './ads.service'
import { AdsController } from './ads.controller'
import { AdminAdsController } from './admin/admin-ads.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Ad, AdClick]), StorageModule],
  providers: [AdsService],
  controllers: [AdsController, AdminAdsController],
  exports: [AdsService],
})
export class AdsModule {}
