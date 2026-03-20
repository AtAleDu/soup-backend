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
import { User } from "@entities/User/user.entity";
import { StorageService } from "@infrastructure/storage/storage.service";
import {
  UPLOAD_IMAGE,
  UPLOAD_VIDEO,
} from "@infrastructure/upload/upload-constraints";
import { SaveCompanyServicesDto } from "./dto/save-company-services.dto";
import { UpdateCompanyServicesModerationDto } from "./dto/update-company-services-moderation.dto";

type TariffFeatures = {
  categories?: number | "all";
  subcategories?: number | "all";
  photos?: number | "all";
  videos?: number | "all";
  [key: string]: unknown;
};

@Injectable()
export class CompanyServicesService {
  constructor(
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(CompanyService)
    private readonly services: Repository<CompanyService>,
    @InjectRepository(ContractorTypeEntity)
    private readonly contractorCategories: Repository<ContractorTypeEntity>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
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
          videoUrls: string[];
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
        videoUrls: Array.isArray(row.videoUrls) ? row.videoUrls : [],
      });
    });

    return {
      categories: Array.from(grouped.values()),
    };
  }

  /** Лимиты категорий/подкатегорий/фото/видео из БД (user.tariff.features). */
  private async getTariffLimits(userId: string) {
    const user = await this.users.findOne({
      where: { id: userId },
      relations: ["tariff"],
    });
    const features = (user?.tariff?.features ?? null) as TariffFeatures | null;
    const maxCategories =
      features?.categories === "all" || features?.categories == null
        ? null
        : typeof features?.categories === "number"
          ? features.categories
          : null;
    const maxSubcategories =
      features?.subcategories === "all" || features?.subcategories == null
        ? null
        : typeof features?.subcategories === "number"
          ? features.subcategories
          : null;
    const maxPhotos =
      features?.photos === "all" || features?.photos == null
        ? null
        : typeof features?.photos === "number"
          ? features.photos
          : null;
    const maxVideos =
      features?.videos === "all" || features?.videos == null
        ? null
        : typeof features?.videos === "number"
          ? features.videos
          : null;
    return { maxCategories, maxSubcategories, maxPhotos, maxVideos };
  }

  async saveServices(userId: string, dto: SaveCompanyServicesDto) {
    const company = await this.getCompanyByUser(userId);

    const { maxCategories, maxSubcategories, maxPhotos, maxVideos } =
      await this.getTariffLimits(userId);
    if (maxCategories != null && dto.categories.length > maxCategories) {
      throw new BadRequestException(
        `По вашему тарифу можно указать не более ${maxCategories} категорий`,
      );
    }
    if (maxSubcategories != null) {
      for (const cat of dto.categories) {
        if (cat.services.length > maxSubcategories) {
          throw new BadRequestException(
            `По вашему тарифу в одной категории можно указать не более ${maxSubcategories} услуг (подкатегорий)`,
          );
        }
      }
    }
    const totalPhotos = dto.categories.reduce(
      (sum, cat) =>
        sum +
        (cat.services?.reduce(
          (s, svc) => s + (Array.isArray(svc.imageUrls) ? svc.imageUrls.length : 0),
          0,
        ) ?? 0),
      0,
    );
    const totalVideos = dto.categories.reduce(
      (sum, cat) =>
        sum +
        (cat.services?.reduce(
          (s, svc) => s + (Array.isArray(svc.videoUrls) ? svc.videoUrls.length : 0),
          0,
        ) ?? 0),
      0,
    );
    if (maxPhotos != null && totalPhotos > maxPhotos) {
      throw new BadRequestException(
        `По вашему тарифу можно загрузить не более ${maxPhotos} фото на все услуги`,
      );
    }
    if (maxVideos != null && totalVideos > maxVideos) {
      throw new BadRequestException(
        `По вашему тарифу можно загрузить не более ${maxVideos} видео на все услуги`,
      );
    }

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
          videoUrls: Array.isArray(service.videoUrls) ? service.videoUrls : [],
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
          videoUrls: string[];
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
        videoUrls: Array.isArray(row.videoUrls) ? row.videoUrls : [],
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
      categoryIcons.map((category) => [
        category.title,
        category.logoUrl ?? null,
      ]),
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
      !dto.rejectionReason?.trim()
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

  async uploadServiceMedia(userId: string, file: Express.Multer.File) {
    if (!file?.buffer) {
      throw new BadRequestException("Файл не передан");
    }
    const isImage = (
      UPLOAD_IMAGE.allowedMimeTypes as readonly string[]
    ).includes(file.mimetype);
    const isVideo = (
      UPLOAD_VIDEO.allowedMimeTypes as readonly string[]
    ).includes(file.mimetype);
    if (isImage) {
      if (file.size > UPLOAD_IMAGE.maxSizeBytes) {
        throw new BadRequestException("Размер файла превышает 5 МБ");
      }
    } else if (isVideo) {
      if (file.size > UPLOAD_VIDEO.maxSizeBytes) {
        throw new BadRequestException("Размер файла превышает 50 МБ");
      }
    } else {
      throw new BadRequestException(
        "Недопустимый формат. Разрешены: PNG, JPEG, WebP, SVG, HEIF (до 5 МБ); MP4, WebM, HEVC (до 50 МБ)",
      );
    }

    const company = await this.getCompanyByUser(userId);
    const ext =
      file.originalname?.match(/\.[a-z0-9]+$/i)?.[0] ??
      (isImage ? ".jpg" : ".mp4");
    const subdir = isImage ? "service-images" : "service-videos";
    const uploadResult = await this.storage.upload(
      {
        buffer: file.buffer,
        mimeType: file.mimetype,
        size: file.size,
        originalName: `service${ext}`,
      },
      {
        allowedMimeTypes: isImage
          ? [...UPLOAD_IMAGE.allowedMimeTypes]
          : [...UPLOAD_VIDEO.allowedMimeTypes],
        maxSizeBytes: isImage
          ? UPLOAD_IMAGE.maxSizeBytes
          : UPLOAD_VIDEO.maxSizeBytes,
        isPublic: true,
        pathPrefix: `personal-account/company-account/${subdir}/${company.companyId}`,
      },
    );

    return { url: uploadResult.url };
  }
}
