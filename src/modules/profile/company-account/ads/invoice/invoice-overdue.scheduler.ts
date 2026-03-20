import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdsInvoiceService } from './invoice.service';

@Injectable()
export class AdsInvoiceOverdueScheduler {
  private readonly logger = new Logger(AdsInvoiceOverdueScheduler.name);

  constructor(private readonly invoiceService: AdsInvoiceService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async markOverdue() {
    try {
      const count = await this.invoiceService.markOverdueInvoices();
      if (count > 0) {
        this.logger.log(`Marked ${count} invoices as overdue`);
      }
    } catch (error) {
      this.logger.error('Failed to mark overdue invoices', error);
    }
  }
}
