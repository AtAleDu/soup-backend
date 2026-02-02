import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Company } from "@entities/Company/company.entity";
import { CompanyService } from "@entities/CompanyService/company-service.entity";
import { SaveCompanyServicesDto } from "./dto/save-company-services.dto";

@Injectable()
export class CompanyServicesService {
  constructor(
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(CompanyService)
    private readonly services: Repository<CompanyService>,
  ) {}

  private async getCompanyByUser(userId: string) {
    const company = await this.companies.findOne({ where: { userId } });
    if (!company) throw new NotFoundException("Комания не найдена");
    return company;
  }

  async getServices(userId: string) {
    const company = await this.getCompanyByUser(userId);
    const rows = await this.services.find({
      where: { companyId: company.companyId },
      order: { category: "ASC", service: "ASC" },
    });

    const grouped = new Map<
      string,
      { category: string; services: { name: string; subcategory: string }[] }
    >();
    rows.forEach((row) => {
      const key = row.category;
      if (!grouped.has(key)) {
        grouped.set(key, {
          category: row.category,
          services: [],
        });
      }
      grouped.get(key)!.services.push({
        name: row.categoryName,
        subcategory: row.service,
      });
    });

    return {
      categories: Array.from(grouped.values()),
    };
  }

  async saveServices(userId: string, dto: SaveCompanyServicesDto) {
    const company = await this.getCompanyByUser(userId);

    await this.services.delete({ companyId: company.companyId });

    const rows = dto.categories.flatMap((category) =>
      category.services.map((service) =>
        this.services.create({
          companyId: company.companyId,
          category: category.category,
          service: service.subcategory,
          categoryName: service.name,
        }),
      ),
    );

    if (rows.length > 0) {
      await this.services.save(rows);
    }

    return { success: true };
  }
}
