import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Company } from "@entities/Company/company.entity";
import { CompanyService } from "@entities/CompanyService/company-service.entity";
import { CompanyServiceStatus } from "@entities/CompanyService/company-service-status.enum";
import { ContractorTypeEntity } from "@entities/Contractor/contractor-categories.entity";
import { StorageService } from "@infrastructure/storage/storage.service";
import { UPLOAD_IMAGE } from "@infrastructure/upload/upload-constraints";
import { SaveCompanyServicesDto } from "./dto/save-company-services.dto";
import { UpdateCompanyServicesModerationDto } from "./dto/update-company-services-moderation.dto";

@Injectable()
export class CompanyServicesService {
  constructor(
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(CompanyService)
    private readonly services: Repository<CompanyService>,
    @InjectRepository(ContractorTypeEntity)
    private readonly contractorCategories: Repository<ContractorTypeEntity>,
    private readonly storage: StorageService,
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
      {
        category: string;
        description?: string;
        iconUrl?: string | null;
        services: {
          name: string;
          subcategory: string;
          imageUrls: string[];
        }[];
      }
    >();
    rows.forEach((row) => {
      const key = row.category;
      if (!grouped.has(key)) {
        grouped.set(key, {
          category: row.category,
          description: row.categoryDescription ?? undefined,
          services: [],
        });
      }
      grouped.get(key)!.services.push({
        name: row.service,
        subcategory: row.service,
        imageUrls: Array.isArray(row.imageUrls) ? row.imageUrls : [],
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
      category.services.map((service, index) =>
        this.services.create({
          companyId: company.companyId,
          category: category.category,
          // Сохраняем описание только в первую услугу категории
          categoryDescription:
            index === 0 ? (category.description ?? null) : null,
          service: service.name,
          imageUrls: Array.isArray(service.imageUrls) ? service.imageUrls : [],
          status: CompanyServiceStatus.MODERATION,
          rejectionReason: null,
        }),
      ),
    );

    if (rows.length > 0) {
      await this.services.save(rows);
    }

    return { success: true };
  }

  async getModerationCompanies() {
    const companies = await this.companies
      .createQueryBuilder("company")
      .innerJoin(
        CompanyService,
        "service",
        "service.companyId = company.companyId AND service.status = :status",
        { status: CompanyServiceStatus.MODERATION },
      )
      .select([
        "company.companyId",
        "company.name",
        "company.logo_url",
        "company.updatedAt",
      ])
      .distinct(true)
      .orderBy("company.updatedAt", "DESC")
      .getMany();

    return companies.map((company) => ({
      id: company.companyId,
      name: company.name,
      logo_url: company.logo_url ?? null,
    }));
  }

  async getModerationCompanyServices(companyId: number) {
    const company = await this.companies.findOne({
      where: { companyId },
      select: {
        companyId: true,
        name: true,
        logo_url: true,
      },
    });

    if (!company) {
      throw new NotFoundException("Компания не найдена");
    }

    const rows = await this.services.find({
      where: {
        companyId,
        status: CompanyServiceStatus.MODERATION,
      },
      order: { category: "ASC", service: "ASC" },
    });

    const grouped = new Map<
      string,
      {
        category: string;
        description?: string;
        iconUrl?: string | null;
        services: {
          name: string;
          subcategory: string;
          imageUrls: string[];
        }[];
      }
    >();

    rows.forEach((row) => {
      const key = row.category;
      if (!grouped.has(key)) {
        grouped.set(key, {
          category: row.category,
          description: row.categoryDescription ?? undefined,
          services: [],
        });
      }

      grouped.get(key)!.services.push({
        name: row.service,
        subcategory: row.service,
        imageUrls: Array.isArray(row.imageUrls) ? row.imageUrls : [],
      });
    });

    const categoryTitles = Array.from(grouped.keys());
    const categoryIcons =
      categoryTitles.length > 0
        ? await this.contractorCategories.find({
            where: categoryTitles.map((title) => ({ title })),
            select: { title: true, logoUrl: true },
          })
        : [];
    const iconByTitle = new Map(
      categoryIcons.map((category) => [category.title, category.logoUrl ?? null]),
    );
    grouped.forEach((value) => {
      value.iconUrl = iconByTitle.get(value.category) ?? null;
    });

    return {
      company: {
        id: String(company.companyId),
        name: company.name,
        description: "",
        logoUrl: company.logo_url ?? null,
        regions: [],
        address: "",
        phones: [],
        emails: [],
        email: "",
        socialLinks: {},
      },
      services: Array.from(grouped.values()),
    };
  }

  async moderateCompanyServices(
    companyId: number,
    dto: UpdateCompanyServicesModerationDto,
  ) {
    const company = await this.companies.findOne({ where: { companyId } });
    if (!company) {
      throw new NotFoundException("Компания не найдена");
    }

    const services = await this.services.find({
      where: { companyId, status: CompanyServiceStatus.MODERATION },
      order: { updatedAt: "DESC" },
    });

    if (services.length === 0) {
      throw new NotFoundException("Услуг на модерации не найдено");
    }

    const nextStatus =
      dto.status === "active"
        ? CompanyServiceStatus.ACTIVE
        : CompanyServiceStatus.REJECTED;
    if (
      nextStatus === CompanyServiceStatus.REJECTED &&
      !(dto.rejectionReason?.trim())
    ) {
      throw new BadRequestException("Укажите причину отказа");
    }
    const rejectionReason =
      nextStatus === CompanyServiceStatus.REJECTED
        ? dto.rejectionReason?.trim() || null
        : null;

    const updatedServices = services.map((item) => ({
      ...item,
      status: nextStatus,
      rejectionReason,
    }));

    await this.services.save(updatedServices);

    return { success: true, count: updatedServices.length };
  }

  async uploadServiceImage(userId: string, file) {
    if (!file?.buffer) {
      throw new BadRequestException("Файл не передан");
    }
    if (!(UPLOAD_IMAGE.allowedMimeTypes as readonly string[]).includes(file.mimetype)) {
      throw new BadRequestException(
        "Недопустимый формат. Разрешены: PNG, JPEG, WebP, SVG",
      );
    }
    if (file.size > UPLOAD_IMAGE.maxSizeBytes) {
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
        allowedMimeTypes: [...UPLOAD_IMAGE.allowedMimeTypes],
        maxSizeBytes: UPLOAD_IMAGE.maxSizeBytes,
        isPublic: true,
        pathPrefix: `personal-account/company-account/service-images/${company.companyId}`,
      },
    );

    return { url: uploadResult.url };
  }
}
