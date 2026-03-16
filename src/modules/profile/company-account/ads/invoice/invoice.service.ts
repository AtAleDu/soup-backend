import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Company } from '@entities/Company/company.entity';
import { AdsInvoice } from '@entities/AdsInvoice/ads-invoice.entity';
import { AdsInvoiceStatus } from '@entities/AdsInvoice/ads-invoice-status.enum';
import type { AdsInvoiceStatusValue } from '@entities/AdsInvoice/ads-invoice-status.enum';
import { CompanyAdsAdvertiserService } from '../advertiser/advertiser.service';
import { CompanyAdsCartService } from '../cart/cart.service';
import { StorageService } from '@infrastructure/storage/storage.service';
import { buildInvoicePdf } from './build-invoice-pdf';
import { INVOICE_PAYMENT_DEADLINE_DAYS } from '../invoice-recipient.constants';

const PDF_MIME = 'application/pdf';
const PDF_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_STATUS_TRANSITIONS: AdsInvoiceStatusValue[] = [
  AdsInvoiceStatus.APPROVED,
  AdsInvoiceStatus.REJECTED,
];

@Injectable()
export class AdsInvoiceService {
  private readonly logger = new Logger(AdsInvoiceService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(AdsInvoice)
    private readonly invoices: Repository<AdsInvoice>,
    private readonly advertiserService: CompanyAdsAdvertiserService,
    private readonly cartService: CompanyAdsCartService,
    private readonly storage: StorageService,
  ) {}

  async createInvoice(userId: string): Promise<{ buffer: Buffer; invoiceNumber: string }> {
    try {
      const advertiser = await this.advertiserService.getAdvertiser(userId);
      if (!advertiser) {
        throw new BadRequestException('Сначала добавьте рекламодателя');
      }

      const { cart } = await this.cartService.getActiveCart(userId);
      if (!cart.items?.length) {
        throw new BadRequestException('Корзина пуста');
      }

      const company = await this.companies.findOne({ where: { userId } });
      if (!company) {
        throw new BadRequestException('Компания не найдена');
      }

      const invoiceNumber = `INV-${Date.now()}`;
      const invoiceDate = new Date();
      const advertiserData = advertiser.data as Record<string, unknown>;
      const cartSnapshot = {
        items: cart.items,
        total: cart.total,
        currency: cart.currency,
      };

      const totalNum = Number(cart.total);
    const itemsSnapshot = cart.items.map(
      (item: {
        positionTitle?: string;
        tariffName?: string;
        quantity: number;
        periodDays: number;
        lineTotal: number | string;
      }) => ({
        positionTitle: item.positionTitle,
        tariffName: item.tariffName,
        quantity: Number(item.quantity),
        periodDays: Number(item.periodDays),
        lineTotal: Number(item.lineTotal),
      }),
    );

    const buffer = await buildInvoicePdf({
      invoiceNumber,
      invoiceDate,
      advertiser: advertiser.data,
      items: itemsSnapshot,
      total: totalNum,
    });

    const pathPrefix = `ads-invoices/company-${company.companyId}`;
    const result = await this.storage.upload(
      {
        buffer,
        mimeType: PDF_MIME,
        size: buffer.length,
        originalName: `${invoiceNumber}.pdf`,
      },
      {
        pathPrefix,
        allowedMimeTypes: [PDF_MIME],
        maxSizeBytes: PDF_MAX_BYTES,
        isPublic: false,
      },
    );

    const pdfStorageKey = result.key;

      await this.invoices.save(
        this.invoices.create({
          companyId: company.companyId,
          advertiserData,
          cartSnapshot,
          total: String(cart.total),
          invoiceNumber,
          status: AdsInvoiceStatus.MODERATION,
          pdfUrl: pdfStorageKey,
          paidAt: null,
          approvedAt: null,
        }),
      );

      return { buffer, invoiceNumber };
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        throw err;
      }
      this.logger.error('createInvoice failed', err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  async updateStatus(
    invoiceId: number,
    status: AdsInvoiceStatusValue,
  ): Promise<AdsInvoice> {
    if (!ALLOWED_STATUS_TRANSITIONS.includes(status)) {
      throw new BadRequestException(
        `Допустимые статусы: ${ALLOWED_STATUS_TRANSITIONS.join(', ')}`,
      );
    }
    const invoice = await this.invoices.findOne({ where: { id: invoiceId } });
    if (!invoice) {
      throw new NotFoundException('Счёт не найден');
    }
    if (invoice.status !== AdsInvoiceStatus.MODERATION) {
      throw new BadRequestException('Счёт уже обработан');
    }
    invoice.status = status;
    if (status === AdsInvoiceStatus.APPROVED) {
      invoice.approvedAt = new Date();
    }
    return this.invoices.save(invoice);
  }

  async markOverdueInvoices(): Promise<number> {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() - INVOICE_PAYMENT_DEADLINE_DAYS);
    const result = await this.invoices.update(
      {
        status: AdsInvoiceStatus.APPROVED,
        approvedAt: LessThan(deadline),
      },
      { status: AdsInvoiceStatus.OVERDUE },
    );
    return result.affected ?? 0;
  }
}
