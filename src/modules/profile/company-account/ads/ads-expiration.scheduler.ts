import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { DataSource } from 'typeorm'
import { CompanyAdsService } from './ads.service'

const ADS_TARIFF_EXPIRATION_LOCK_ID = 18242026

@Injectable()
export class AdsExpirationScheduler {
  private readonly logger = new Logger(AdsExpirationScheduler.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly companyAdsService: CompanyAdsService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleTariffExpiration() {
    const lockAcquired = await this.tryAcquireLock()
    if (!lockAcquired) return

    try {
      const { affected } = await this.companyAdsService.downgradeExpiredTariffsBatch()
      if (affected > 0) {
        this.logger.log(`Downgraded ${affected} expired company tariffs to default`)
      }
    } catch (error) {
      this.logger.error('Failed to process expired company tariffs', error)
    } finally {
      await this.releaseLock()
    }
  }

  private async tryAcquireLock() {
    const result = await this.dataSource.query(
      'SELECT pg_try_advisory_lock($1) AS locked',
      [ADS_TARIFF_EXPIRATION_LOCK_ID],
    )
    return Boolean(result?.[0]?.locked)
  }

  private async releaseLock() {
    await this.dataSource.query('SELECT pg_advisory_unlock($1)', [
      ADS_TARIFF_EXPIRATION_LOCK_ID,
    ])
  }
}

