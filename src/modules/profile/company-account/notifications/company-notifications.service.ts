import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import { Company } from "@entities/Company/company.entity";
import { CompanyStatus } from "@entities/Company/company-status.enum";
import { Blog, BlogStatus } from "@entities/Blog/blog.entity";
import { CompanyService } from "@entities/CompanyService/company-service.entity";
import { CompanyServiceStatus } from "@entities/CompanyService/company-service-status.enum";
import { OrderSuggestion } from "@entities/OrderSuggestion/order-suggestion.entity";
import { NotificationReadService } from "../../notifications/notification-read.service";

export type CompanyNotificationItem = {
  id: string;
  entityType: "blog" | "service" | "company" | "order_suggestion";
  entityId: string;
  entityTitle: string;
  status: "rejected" | "approved";
  rejectionReason?: string;
  createdAt: string;
  read: boolean;
};

type CompanyNotificationItemRaw = Omit<CompanyNotificationItem, "read">;

@Injectable()
export class CompanyNotificationsService {
  constructor(
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(Blog)
    private readonly blogs: Repository<Blog>,
    @InjectRepository(CompanyService)
    private readonly services: Repository<CompanyService>,
    @InjectRepository(OrderSuggestion)
    private readonly orderSuggestions: Repository<OrderSuggestion>,
    private readonly notificationReadService: NotificationReadService,
  ) {}

  private async getCompanyByUser(userId: string) {
    const company = await this.companies.findOne({ where: { userId } });
    if (!company) throw new NotFoundException("Компания не найдена");
    return company;
  }

  async getNotifications(userId: string): Promise<CompanyNotificationItem[]> {
    const company = await this.getCompanyByUser(userId);
    const companyId = company.companyId;

    const [
      blogRejected,
      blogApproved,
      servicesActive,
      servicesRejected,
      suggestions,
    ] = await Promise.all([
        this.blogs.find({
          where: {
            companyId,
            status: BlogStatus.DRAFT,
            rejectionReason: Not(IsNull()),
          },
          order: { createdAt: "DESC" },
        }),
        this.blogs.find({
          where: {
            companyId,
            status: BlogStatus.PUBLISHED,
            approvedAt: Not(IsNull()),
          },
          order: { approvedAt: "DESC" },
        }),
        this.services.find({
          where: { companyId, status: CompanyServiceStatus.ACTIVE },
          order: { updatedAt: "DESC" },
        }),
        this.services.find({
          where: { companyId, status: CompanyServiceStatus.REJECTED },
          order: { updatedAt: "DESC" },
        }),
      this.orderSuggestions.find({
        where: { companyId },
        relations: { order: true },
        order: { createdAt: "DESC" },
      }),
    ]);

    const toDateStr = (d: Date | string) =>
      d instanceof Date ? d.toISOString() : String(d);

    const blogRejectedItems = blogRejected.map(
      (b) => ({
        id: b.id,
        entityType: "blog" as const,
        entityId: b.id,
        entityTitle: b.title,
        status: "rejected" as const,
        rejectionReason: b.rejectionReason ?? undefined,
        createdAt: toDateStr(b.createdAt),
      }),
    );

    const blogApprovedItems = blogApproved.map(
      (b) => ({
        id: b.id,
        entityType: "blog" as const,
        entityId: b.id,
        entityTitle: b.title,
        status: "approved" as const,
        createdAt: toDateStr(b.approvedAt ?? b.createdAt),
      }),
    );

    const latestApprovedService = servicesActive[0];
    const latestRejectedService = servicesRejected[0];

    let serviceItem: CompanyNotificationItemRaw | null = null;
    if (latestApprovedService && latestRejectedService) {
      const approvedTime = new Date(latestApprovedService.updatedAt).getTime();
      const rejectedTime = new Date(latestRejectedService.updatedAt).getTime();
      serviceItem =
        approvedTime >= rejectedTime
          ? {
              id: `service-approved-${latestApprovedService.id}`,
              entityType: "service" as const,
              entityId: String(latestApprovedService.companyId),
              entityTitle: "Услуги",
              status: "approved" as const,
              createdAt: toDateStr(latestApprovedService.updatedAt),
            }
          : {
              id: `service-rejected-${latestRejectedService.id}`,
              entityType: "service" as const,
              entityId: String(latestRejectedService.companyId),
              entityTitle: "Услуги",
              status: "rejected" as const,
              rejectionReason: latestRejectedService.rejectionReason ?? undefined,
              createdAt: toDateStr(latestRejectedService.updatedAt),
            };
    } else if (latestApprovedService) {
      serviceItem = {
        id: `service-approved-${latestApprovedService.id}`,
        entityType: "service" as const,
        entityId: String(latestApprovedService.companyId),
        entityTitle: "Услуги",
        status: "approved" as const,
        createdAt: toDateStr(latestApprovedService.updatedAt),
      };
    } else if (latestRejectedService) {
      serviceItem = {
        id: `service-rejected-${latestRejectedService.id}`,
        entityType: "service" as const,
        entityId: String(latestRejectedService.companyId),
        entityTitle: "Услуги",
        status: "rejected" as const,
        rejectionReason: latestRejectedService.rejectionReason ?? undefined,
        createdAt: toDateStr(latestRejectedService.updatedAt),
      };
    }

    const companyItem: CompanyNotificationItemRaw | null =
      company.status === CompanyStatus.ACTIVE
        ? {
            id: `company-approved-${company.companyId}`,
            entityType: "company",
            entityId: String(company.companyId),
            entityTitle: company.name,
            status: "approved",
            createdAt: toDateStr(company.updatedAt),
          }
        : company.status === CompanyStatus.REJECTED
          ? {
              id: `company-rejected-${company.companyId}`,
              entityType: "company",
              entityId: String(company.companyId),
              entityTitle: company.name,
              status: "rejected",
              rejectionReason: company.rejectionReason ?? undefined,
              createdAt: toDateStr(company.updatedAt),
            }
          : null;

    const orderSuggestionItems = suggestions.map(
      (s) => ({
        id: `order_suggestion-${s.id}`,
        entityType: "order_suggestion" as const,
        entityId: String(s.orderId),
        entityTitle: s.order?.title ?? "Заказ",
        status: "approved" as const,
        createdAt: toDateStr(s.createdAt),
      }),
    );

    const merged = [
      ...blogRejectedItems,
      ...blogApprovedItems,
      ...(serviceItem ? [serviceItem] : []),
      ...(companyItem ? [companyItem] : []),
      ...orderSuggestionItems,
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const readIds = await this.notificationReadService.getReadIds(
      userId,
      "company",
      merged.map((i) => i.id),
    );

    return merged.map((item) => ({
      ...item,
      read: readIds.has(item.id),
    }));
  }
}
