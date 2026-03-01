import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import { Company } from "@entities/Company/company.entity";
import { Blog, BlogStatus } from "@entities/Blog/blog.entity";
import { CompanyService } from "@entities/CompanyService/company-service.entity";
import { CompanyServiceStatus } from "@entities/CompanyService/company-service-status.enum";

export type CompanyNotificationItem = {
  id: string;
  entityType: "blog" | "service";
  entityId: string;
  entityTitle: string;
  status: "rejected" | "approved";
  rejectionReason?: string;
  createdAt: string;
};

@Injectable()
export class CompanyNotificationsService {
  constructor(
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(Blog)
    private readonly blogs: Repository<Blog>,
    @InjectRepository(CompanyService)
    private readonly services: Repository<CompanyService>,
  ) {}

  private async getCompanyByUser(userId: string) {
    const company = await this.companies.findOne({ where: { userId } });
    if (!company) throw new NotFoundException("Компания не найдена");
    return company;
  }

  async getNotifications(userId: string): Promise<CompanyNotificationItem[]> {
    const company = await this.getCompanyByUser(userId);
    const companyId = company.companyId;

    const [blogRejected, blogApproved, servicesActive, servicesRejected] =
      await Promise.all([
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
      ]);

    const toDateStr = (d: Date | string) =>
      d instanceof Date ? d.toISOString() : String(d);

    const blogRejectedItems: CompanyNotificationItem[] = blogRejected.map(
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

    const blogApprovedItems: CompanyNotificationItem[] = blogApproved.map(
      (b) => ({
        id: b.id,
        entityType: "blog" as const,
        entityId: b.id,
        entityTitle: b.title,
        status: "approved" as const,
        createdAt: toDateStr(b.approvedAt ?? b.createdAt),
      }),
    );

    const serviceApprovedItems: CompanyNotificationItem[] = servicesActive.map(
      (s) => ({
        id: s.id,
        entityType: "service" as const,
        entityId: s.id,
        entityTitle: s.categoryName,
        status: "approved" as const,
        createdAt: toDateStr(s.updatedAt),
      }),
    );

    const serviceRejectedItems: CompanyNotificationItem[] =
      servicesRejected.map((s) => ({
        id: s.id,
        entityType: "service" as const,
        entityId: s.id,
        entityTitle: s.categoryName,
        status: "rejected" as const,
        createdAt: toDateStr(s.updatedAt),
      }));

    const merged = [
      ...blogRejectedItems,
      ...blogApprovedItems,
      ...serviceApprovedItems,
      ...serviceRejectedItems,
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return merged;
  }
}
