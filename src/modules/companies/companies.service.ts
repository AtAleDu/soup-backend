import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { Company } from "@entities/Company/company.entity";
import { CompanyService } from "@entities/CompanyService/company-service.entity";

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly repo: Repository<Company>,
    @InjectRepository(CompanyService)
    private readonly services: Repository<CompanyService>,
  ) {}

  async findAll(filters?: string) {
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

    if (parsedFilters.length > 0) {
      const qb = this.repo
        .createQueryBuilder("company")
        .select(["company.companyId", "company.name", "company.description", "company.logo_url"])
        .distinct(true)
        .innerJoin(CompanyService, "service", "service.companyId = company.companyId")
        .where(
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
        )
        .orderBy("company.createdAt", "DESC");

      return qb.getMany();
    }

    return this.repo.find({
      select: {
        companyId: true,
        name: true,
        description: true,
        logo_url: true,
      },
      order: {
        createdAt: "DESC",
      },
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
      },
      services: Array.from(grouped.values()),
    };
  }
}
