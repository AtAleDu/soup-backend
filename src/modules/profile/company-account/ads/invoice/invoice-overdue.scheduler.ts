import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdsInvoiceService } from './invoice.service';

@Injectable()
export class AdsInvoiceOverdueScheduler {
  private readonly logger = new Logger(AdsInvoiceOverdueScheduler.name);

  constructor(private readonly invoiceService: AdsInvoiceService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runInvoiceStatusJobs() {
    try {
      const overdueCount = await this.invoiceService.markOverdueInvoices();
      if (overdueCount > 0) {
        this.logger.log(`Marked ${overdueCount} invoices as overdue`);
      }
      const expiredCount = await this.invoiceService.markExpiredInvoices();
      if (expiredCount > 0) {
        this.logger.log(`Marked ${expiredCount} invoices as expired`);
      }
    } catch (error) {
      this.logger.error('Failed invoice status jobs', error);
    }
  }
}
