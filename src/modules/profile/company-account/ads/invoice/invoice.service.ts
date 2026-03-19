import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, Repository } from 'typeorm';
import { Company } from '@entities/Company/company.entity';
import { AdsInvoice } from '@entities/AdsInvoice/ads-invoice.entity';
import { AdsInvoiceStatus } from '@entities/AdsInvoice/ads-invoice-status.enum';
import type { AdsInvoiceStatusValue } from '@entities/AdsInvoice/ads-invoice-status.enum';
import { Tariff } from '@entities/Tarif/tariff.entity';
import { User } from '@entities/User/user.entity';
import { CompanyAdsAdvertiserService } from '../advertiser/advertiser.service';
import { CompanyAdsCartService } from '../cart/cart.service';
import { StorageService } from '@infrastructure/storage/storage.service';
import { buildInvoicePdf } from './build-invoice-pdf';
import { INVOICE_PAYMENT_DEADLINE_DAYS } from '../invoice-recipient.constants';

const PDF_MIME = 'application/pdf';
const PDF_MAX_BYTES = 10 * 1024 * 1024;
const PDF_SIGNED_URL_TTL_SECONDS = 300;

@Injectable()
export class AdsInvoiceService {
  private readonly logger = new Logger(AdsInvoiceService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(AdsInvoice)
    private readonly invoices: Repository<AdsInvoice>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Tariff)
    private readonly tariffs: Repository<Tariff>,
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

  async getPdfSignedUrlForAdmin(invoiceId: number): Promise<string> {
    const invoice = await this.invoices.findOne({ where: { id: invoiceId } });
    if (!invoice) {
      throw new NotFoundException('Счёт не найден');
    }
    if (!invoice.pdfUrl) {
      throw new BadRequestException('Для счёта не найден PDF');
    }

    return this.storage.getSignedUrl(invoice.pdfUrl, PDF_SIGNED_URL_TTL_SECONDS);
  }

  async findForAdmin(status?: AdsInvoiceStatusValue): Promise<AdsInvoice[]> {
    const where = status ? { status } : {};
    return this.invoices.find({
      where,
      relations: ['company'],
      order: { createdAt: 'DESC' },
    });
  }

  private async resolveInvoiceTariff(invoice: AdsInvoice): Promise<Tariff> {
    const snapshot = (invoice.cartSnapshot ?? {}) as {
      items?: Array<{ tariffId?: number; tariffName?: string | null }>;
    };

    const tariffItemWithId = snapshot.items?.find(
      (item) => typeof item?.tariffId === 'number',
    );
    if (typeof tariffItemWithId?.tariffId === 'number') {
      const tariff = await this.tariffs.findOne({ where: { id: tariffItemWithId.tariffId } });
      if (tariff) return tariff;
    }

    const tariffItemWithName = snapshot.items?.find(
      (item) => typeof item?.tariffName === 'string' && item.tariffName.trim().length > 0,
    );
    if (tariffItemWithName?.tariffName) {
      const tariff = await this.tariffs.findOne({
        where: { name: tariffItemWithName.tariffName.trim() },
      });
      if (tariff) return tariff;
    }

    throw new BadRequestException('Не удалось определить тариф по выставленному счёту');
  }

  async rejectByAdmin(invoiceId: number): Promise<AdsInvoice> {
    const invoice = await this.invoices.findOne({ where: { id: invoiceId } });
    if (!invoice) {
      throw new NotFoundException('Счёт не найден');
    }
    if (invoice.status !== AdsInvoiceStatus.MODERATION) {
      throw new BadRequestException('Счёт уже обработан');
    }
    invoice.status = AdsInvoiceStatus.REJECTED;
    return this.invoices.save(invoice);
  }

  async confirmPaidByAdmin(invoiceId: number): Promise<AdsInvoice> {
    const invoice = await this.invoices.findOne({
      where: { id: invoiceId },
      relations: ['company'],
    });
    if (!invoice) {
      throw new NotFoundException('Счёт не найден');
    }
    if (invoice.status !== AdsInvoiceStatus.MODERATION) {
      throw new BadRequestException('Счёт уже обработан');
    }

    const companyUserId = invoice.company?.userId;
    if (!companyUserId) {
      throw new BadRequestException('Для компании не найден пользователь');
    }

    const [user, tariff] = await Promise.all([
      this.users.findOne({ where: { id: companyUserId } }),
      this.resolveInvoiceTariff(invoice),
    ]);
    if (!user) {
      throw new NotFoundException('Пользователь компании не найден');
    }

    const now = new Date();
    user.tariff = tariff;
    user.tariffStartAt = now;
    user.tariffEndAt =
      tariff.duration_days != null
        ? new Date(now.getTime() + tariff.duration_days * 24 * 60 * 60 * 1000)
        : null;

    invoice.status = AdsInvoiceStatus.PAID;
    invoice.paidAt = now;
    invoice.approvedAt = now;

    await this.dataSource.transaction(async (manager) => {
      await manager.save(User, user);
      await manager.save(AdsInvoice, invoice);
    });

    return invoice;
  }

  async markOverdueInvoices(): Promise<number> {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() - INVOICE_PAYMENT_DEADLINE_DAYS);
    const result = await this.invoices.update(
      {
        status: AdsInvoiceStatus.MODERATION,
        createdAt: LessThan(deadline),
      },
      { status: AdsInvoiceStatus.OVERDUE },
    );
    return result.affected ?? 0;
  }
}
