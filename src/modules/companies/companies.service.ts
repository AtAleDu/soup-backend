import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { Company } from "@entities/Company/company.entity";
import { CompanyService } from "@entities/CompanyService/company-service.entity";
import { CompanyReview } from "@entities/CompanyReview/company-review.entity";

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly repo: Repository<Company>,
    @InjectRepository(CompanyService)
    private readonly services: Repository<CompanyService>,
    @InjectRepository(CompanyReview)
    private readonly reviews: Repository<CompanyReview>,
  ) {}

  async findAll(filters?: string, regions?: string, sort?: string) {
    const parsedFilters = (filters ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [category, service] = entry.split("||");
        if (!category || !service) return null;
        return {
          category: decodeURIComponent(category),
          service: decodeURIComponent(service),
        };
      })
      .filter(Boolean) as { category: string; service: string }[];

    const parsedRegions = (regions ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => decodeURIComponent(entry));

    if (parsedFilters.length > 0 || parsedRegions.length > 0) {
      const qb = this.repo
        .createQueryBuilder("company")
        .select([
          "company.companyId",
          "company.name",
          "company.description",
          "company.logo_url",
          "company.address",
          "company.createdAt",
        ])
        .distinct(true)
        .orderBy("company.createdAt", "DESC");

      if (parsedFilters.length > 0) {
        qb.innerJoin(CompanyService, "service", "service.companyId = company.companyId").where(
          new Brackets((builder) => {
            parsedFilters.forEach((filter, index) => {
              builder.orWhere(
                "(service.category = :category" +
                  index +
                  " AND service.service = :service" +
                  index +
                  ")",
                {
                  ["category" + index]: filter.category,
                  ["service" + index]: filter.service,
                },
              );
            });
          }),
        );
      }

      if (parsedRegions.length > 0) {
        if (parsedFilters.length > 0) {
          qb.andWhere("company.regions ?| array[:...regions]", { regions: parsedRegions });
        } else {
          qb.where("company.regions ?| array[:...regions]", { regions: parsedRegions });
        }
      }

      const companies = await qb.getMany();
      const withStats = await this.withRatings(companies);
      return this.applySort(withStats, sort);
    }

    const companies = await this.repo.find({
      select: {
        companyId: true,
        name: true,
        description: true,
        logo_url: true,
        address: true,
      },
      order: {
        createdAt: "DESC",
      },
    });
    const withStats = await this.withRatings(companies);
    return this.applySort(withStats, sort);
  }

  private applySort<T extends { rating?: number; reviews_count?: number }>(
    list: T[],
    sort?: string,
  ): T[] {
    if (sort === "rating") {
      return [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    if (sort === "reviews") {
      return [...list].sort((a, b) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0));
    }
    return list;
  }

  /** Добавляет к списку компаний средний рейтинг и количество отзывов */
  private async withRatings(
    companies: Pick<Company, "companyId" | "name" | "description" | "logo_url" | "address">[],
  ) {
    if (companies.length === 0) return [];
    const ids = companies.map((c) => c.companyId);
    const raw = await this.reviews
      .createQueryBuilder("r")
      .select("r.companyId", "companyId")
      .addSelect("COALESCE(AVG(r.rating), 0)", "rating")
      .addSelect("COUNT(r.id)", "reviews_count")
      .where("r.companyId IN (:...ids)", { ids })
      .groupBy("r.companyId")
      .getRawMany<{ companyId: number; rating: string; reviews_count: string }>();
    const byId = new Map(
      raw.map((r) => [
        r.companyId,
        {
          rating: Math.round(Number(r.rating) * 10) / 10,
          reviews_count: Number(r.reviews_count) ?? 0,
        },
      ]),
    );
    return companies.map((c) => {
      const stats = byId.get(c.companyId) ?? { rating: 0, reviews_count: 0 };
      return {
        ...c,
        rating: stats.rating,
        reviews_count: stats.reviews_count,
      };
    });
  }

  async findOne(companyId: number) {
    const company = await this.repo.findOne({
      where: { companyId },
      select: {
        companyId: true,
        name: true,
        description: true,
        logo_url: true,
        regions: true,
        address: true,
        phones: true,
        emails: true,
        email: true,
        social_links: true,
      },
    });
    if (!company) {
      throw new NotFoundException("Компания не найдена");
    }

    const rows = await this.services.find({
      where: { companyId: company.companyId },
      order: { category: "ASC", service: "ASC" },
    });

    const grouped = new Map<
      string,
      { category: string; services: { name: string; subcategory: string; imageUrl: string | null }[] }
    >();
    rows.forEach((row) => {
      const key = row.category;
      if (!grouped.has(key)) {
        grouped.set(key, { category: row.category, services: [] });
      }
      grouped.get(key)!.services.push({
        name: row.categoryName,
        subcategory: row.service,
        imageUrl: row.imageUrl ?? null,
      });
    });

    return {
      company: {
        id: String(company.companyId),
        name: company.name,
        description: company.description ?? "",
        logoUrl: company.logo_url ?? null,
        regions: Array.isArray(company.regions) ? company.regions : [],
        address: company.address ?? "",
        phones: Array.isArray(company.phones) ? company.phones : [],
        emails: Array.isArray(company.emails) ? company.emails : [],
        email: company.email ?? "",
        socialLinks: company.social_links ?? {},
      },
      services: Array.from(grouped.values()),
    };
  }
}
