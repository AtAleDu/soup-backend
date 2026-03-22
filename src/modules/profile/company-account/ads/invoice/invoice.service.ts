import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, LessThanOrEqual, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
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
import {
  COMPANY_INVOICE_OVERDUE_GRACE_HOURS,
  COMPANY_INVOICE_PAYMENT_DEADLINE_DAYS,
} from '../invoice-recipient.constants';

const PDF_MIME = 'application/pdf';
const PDF_MAX_BYTES = 10 * 1024 * 1024;
const PDF_SIGNED_URL_TTL_SECONDS = 300;

const RENEWAL_EXTEND_MS = 30 * 24 * 60 * 60 * 1000;

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function isAwaitingCompanyAction(status: AdsInvoiceStatusValue): boolean {
  return (
    status === AdsInvoiceStatus.AWAITING_PAYMENT || status === AdsInvoiceStatus.MODERATION
  );
}

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

      const invoiceNumber = `INV-${randomUUID()}`;
      const invoiceDate = new Date();
      const paymentDueAt = addDays(invoiceDate, COMPANY_INVOICE_PAYMENT_DEADLINE_DAYS);
      const advertiserData = advertiser.data as Record<string, unknown>;

      const cartSnapshot = {
        items: cart.items.map((item: Record<string, unknown>) => ({
          ...item,
          tariffId: item.tariffId ?? null,
          positionTitle: item.positionTitle ?? null,
          tariffName: item.tariffName ?? null,
          quantity: Number(item.quantity ?? 0),
          periodDays: Number(item.periodDays ?? 0),
          lineTotal: Number(item.lineTotal ?? 0),
        })),
        total: cart.total,
        currency: cart.currency,
      };

      const totalNum = Number(cart.total);
      const itemsSnapshot = cart.items.map(
        (item: {
          tariffId?: number | null;
          positionTitle?: string | null;
          tariffName?: string | null;
          quantity: number;
          periodDays: number;
          lineTotal: number | string;
        }) => ({
          tariffId: item.tariffId ?? undefined,
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
          status: AdsInvoiceStatus.AWAITING_PAYMENT,
          paymentDueAt,
          overdueStartedAt: null,
          pdfUrl: pdfStorageKey,
          paidAt: null,
          approvedAt: null,
        }),
      );

      await this.cartService.clearActiveCart(userId);

      return { buffer, invoiceNumber };
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        throw err;
      }
      this.logger.error('createInvoice failed', err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  async findForCompany(userId: string): Promise<AdsInvoice[]> {
    const company = await this.companies.findOne({ where: { userId } });
    if (!company) {
      return [];
    }

    const now = new Date();
    const graceMs = COMPANY_INVOICE_OVERDUE_GRACE_HOURS * 60 * 60 * 1000;
    const overdueCutoff = new Date(now.getTime() - graceMs);

    return this.invoices
      .createQueryBuilder('inv')
      .where('inv.companyId = :companyId', { companyId: company.companyId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('inv.status IN (:...awaiting)', {
            awaiting: [AdsInvoiceStatus.AWAITING_PAYMENT, AdsInvoiceStatus.MODERATION],
          }).orWhere(
            new Brackets((qb2) => {
              qb2
                .where('inv.status = :overdue', { overdue: AdsInvoiceStatus.OVERDUE })
                .andWhere('inv.overdueStartedAt IS NOT NULL')
                .andWhere('inv.overdueStartedAt > :overdueCutoff', { overdueCutoff });
            }),
          );
        }),
      )
      .orderBy('inv.createdAt', 'DESC')
      .getMany();
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

  async getPdfSignedUrlForCompany(userId: string, invoiceId: number): Promise<string> {
    const invoice = await this.assertInvoiceVisibleToCompany(userId, invoiceId);
    if (!invoice.pdfUrl) {
      throw new BadRequestException('Для счёта не найден PDF');
    }
    return this.storage.getSignedUrl(invoice.pdfUrl, PDF_SIGNED_URL_TTL_SECONDS);
  }

  private async assertInvoiceVisibleToCompany(
    userId: string,
    invoiceId: number,
  ): Promise<AdsInvoice> {
    const company = await this.companies.findOne({ where: { userId } });
    if (!company) {
      throw new NotFoundException('Компания не найдена');
    }

    const invoice = await this.invoices.findOne({ where: { id: invoiceId } });
    if (!invoice || invoice.companyId !== company.companyId) {
      throw new ForbiddenException('Нет доступа к счёту');
    }

    const visible = await this.findForCompany(userId);
    if (!visible.some((i) => i.id === invoiceId)) {
      throw new NotFoundException('Счёт не найден');
    }

    return invoice;
  }

  async markPaidByCompany(userId: string, invoiceId: number): Promise<AdsInvoice> {
    const company = await this.companies.findOne({ where: { userId } });
    if (!company) {
      throw new NotFoundException('Компания не найдена');
    }

    const invoice = await this.invoices.findOne({ where: { id: invoiceId } });
    if (!invoice || invoice.companyId !== company.companyId) {
      throw new ForbiddenException('Нет доступа к счёту');
    }

    if (!isAwaitingCompanyAction(invoice.status)) {
      throw new BadRequestException('Счёт нельзя отметить оплаченным в текущем статусе');
    }

    const now = new Date();
    const due =
      invoice.paymentDueAt ??
      addDays(invoice.createdAt, COMPANY_INVOICE_PAYMENT_DEADLINE_DAYS);
    if (due.getTime() < now.getTime()) {
      throw new BadRequestException('Срок для отметки «Оплачено» истёк');
    }

    invoice.status = AdsInvoiceStatus.PAYMENT_REVIEW;
    return this.invoices.save(invoice);
  }

  async findForAdmin(status?: AdsInvoiceStatusValue): Promise<AdsInvoice[]> {
    const effectiveStatus = status ?? AdsInvoiceStatus.PAYMENT_REVIEW;
    return this.invoices.find({
      where: { status: effectiveStatus },
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
    if (invoice.status !== AdsInvoiceStatus.PAYMENT_REVIEW) {
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
    if (invoice.status !== AdsInvoiceStatus.PAYMENT_REVIEW) {
      throw new BadRequestException('Счёт уже обработан');
    }

    const companyUserId = invoice.company?.userId;
    if (!companyUserId) {
      throw new BadRequestException('Для компании не найден пользователь');
    }

    const [user, tariffFromInvoice] = await Promise.all([
      this.users.findOne({
        where: { id: companyUserId },
        relations: ['tariff'],
      }),
      this.resolveInvoiceTariff(invoice),
    ]);
    if (!user) {
      throw new NotFoundException('Пользователь компании не найден');
    }

    const now = new Date();
    const sameTariff =
      user.tariff != null && user.tariff.id === tariffFromInvoice.id;
    const stillActive =
      user.tariffEndAt != null && user.tariffEndAt.getTime() > now.getTime();

    if (sameTariff && stillActive && user.tariffEndAt) {
      user.tariffEndAt = new Date(user.tariffEndAt.getTime() + RENEWAL_EXTEND_MS);
    } else {
      user.tariff = tariffFromInvoice;
      user.tariffStartAt = now;
      user.tariffEndAt =
        tariffFromInvoice.duration_days != null
          ? new Date(
              now.getTime() + tariffFromInvoice.duration_days * 24 * 60 * 60 * 1000,
            )
          : null;
    }

    invoice.status = AdsInvoiceStatus.PAID;
    invoice.paidAt = now;
    invoice.approvedAt = now;

    await this.dataSource.transaction(async (manager) => {
      await manager.save(User, user);
      await manager.save(AdsInvoice, invoice);
    });

    return invoice;
  }

  /** Счета без «Оплачено» за 7 дней → overdue + overdueStartedAt */
  async markOverdueInvoices(): Promise<number> {
    const now = new Date();
    const legacyDeadline = addDays(now, -COMPANY_INVOICE_PAYMENT_DEADLINE_DAYS);

    const result = await this.invoices
      .createQueryBuilder()
      .update(AdsInvoice)
      .set({
        status: AdsInvoiceStatus.OVERDUE,
        overdueStartedAt: now,
      })
      .where('status IN (:...st)', {
        st: [AdsInvoiceStatus.AWAITING_PAYMENT, AdsInvoiceStatus.MODERATION],
      })
      .andWhere(
        new Brackets((sub) => {
          sub
            .where('paymentDueAt IS NOT NULL AND paymentDueAt < :now', { now })
            .orWhere('paymentDueAt IS NULL AND createdAt < :legacyDeadline', {
              legacyDeadline,
            });
        }),
      )
      .execute();

    return result.affected ?? 0;
  }

  /** После overdue + 24 ч → expired (скрыто для компании) */
  async markExpiredInvoices(): Promise<number> {
    const graceMs = COMPANY_INVOICE_OVERDUE_GRACE_HOURS * 60 * 60 * 1000;
    const boundary = new Date(Date.now() - graceMs);

    const result = await this.invoices.update(
      {
        status: AdsInvoiceStatus.OVERDUE,
        overdueStartedAt: LessThanOrEqual(boundary),
      },
      { status: AdsInvoiceStatus.EXPIRED },
    );
    return result.affected ?? 0;
  }
}
