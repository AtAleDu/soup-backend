import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Company } from "@entities/Company/company.entity";
import { CompanyService } from "@entities/CompanyService/company-service.entity";
import { StorageService } from "@infrastructure/storage/storage.service";
import { SERVICE_IMAGE_MAX_SIZE, SERVICE_IMAGE_MIME_TYPES } from "./company-services.constants";
import { SaveCompanyServicesDto } from "./dto/save-company-services.dto";

@Injectable()
export class CompanyServicesService {
  constructor(
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(CompanyService)
    private readonly services: Repository<CompanyService>,
    private readonly storage: StorageService,
  ) { }

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
      { category: string; services: { name: string; subcategory: string; imageUrl: string | null }[] }
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
        imageUrl: row.imageUrl ?? null,
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
          imageUrl: service.imageUrl ?? null,
        }),
      ),
    );

    if (rows.length > 0) {
      await this.services.save(rows);
    }

    return { success: true };
  }

  async uploadServiceImage(userId: string, file) {
    if (!file?.buffer) {
      throw new BadRequestException("Файл не передан");
    }
    if (!SERVICE_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException("Недопустимый формат. Разрешены: PNG, JPEG, WebP");
    }
    if (file.size > SERVICE_IMAGE_MAX_SIZE) {
      throw new BadRequestException("Размер файла превышает 5 МБ");
    }

    const company = await this.getCompanyByUser(userId);
    const ext = file.originalname?.match(/\.[a-z]+$/i)?.[0] ?? ".jpg";
    const uploadResult = await this.storage.upload(
      {
        buffer: file.buffer,
        mimeType: file.mimetype,
        size: file.size,
        originalName: `service${ext}`,
      },
      {
        allowedMimeTypes: SERVICE_IMAGE_MIME_TYPES,
        maxSizeBytes: SERVICE_IMAGE_MAX_SIZE,
        isPublic: true,
        pathPrefix: `personal-account/company-account/service-images/${company.companyId}`,
      },
    );

    return { url: uploadResult.url };
  }
}
