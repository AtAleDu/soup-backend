import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NewsEntity } from "@entities/News/news.entity";
import { Ad } from "@entities/Ad/ad.entity";
import { AdKind } from "@entities/Ad/ad-kind.enum";
import { AdStatus } from "@entities/Ad/ad-status.enum";
import { CreateNewsDto } from "./dto/create-news.dto";
import { UpdateNewsDto } from "./dto/update-news.dto";
import { getNewsByIdOrFail, resetImportantNews } from "./news.utils";
import { StorageService } from "@infrastructure/storage/storage.service";
import { UPLOAD_IMAGE } from "@infrastructure/upload/upload-constraints";

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly repo: Repository<NewsEntity>,
    @InjectRepository(Ad)
    private readonly ads: Repository<Ad>,
    private readonly storage: StorageService,
  ) {}

  async create(dto: CreateNewsDto) {
    const news = this.repo.create(dto);
    return this.repo.save(news);
  }

  private mapMixedAd(ad: Ad) {
    return {
      kind: "ad" as const,
      data: {
        id: ad.id,
        adKind: ad.adKind,
        placement: ad.placement,
        title: ad.title,
        description: ad.description,
        imageUrl: ad.imageUrl,
        clickUrl: `/ads/${ad.id}/click`,
      },
    };
  }

  private buildNewsWithSingleBanner(news: NewsEntity[], ad: Ad | null) {
    const mixed: Array<{ kind: "news"; data: NewsEntity } | { kind: "ad"; data: any }> =
      news.map((item) => ({ kind: "news", data: item }));
    if (!ad) {
      return mixed;
    }

    const randomIndex = Math.floor(Math.random() * (mixed.length + 1));
    mixed.splice(randomIndex, 0, this.mapMixedAd(ad));
    return mixed;
  }

  async findAll(time?: string, category?: string, withAds?: boolean) {
    const qb = this.repo
      .createQueryBuilder("news")
      .orderBy("news.isImportantNew", "DESC")
      .addOrderBy("news.createdAt", "DESC");

    if (time === "week" || time === "month") {
      const days = time === "week" ? 7 : 30;
      const since = new Date();
      since.setDate(since.getDate() - days);
      qb.andWhere("news.createdAt >= :since", { since });
    }

    if (category) {
      qb.andWhere("news.category = :category", { category });
    }

    if (withAds) {
      qb.limit(9);
    }

    const list = await qb.getMany();
    if (!withAds) {
      return list;
    }

    const ad = await this.ads
      .createQueryBuilder("ad")
      .where("ad.status = :status", { status: AdStatus.ACTIVE })
      .andWhere("ad.is_active = true")
      .andWhere("ad.ad_kind = :adKind", { adKind: AdKind.BANNER })
      .andWhere("(ad.start_date IS NULL OR ad.start_date <= CURRENT_DATE)")
      .andWhere("(ad.end_date IS NULL OR ad.end_date >= CURRENT_DATE)")
      .orderBy("RANDOM()")
      .getOne();

    return this.buildNewsWithSingleBanner(list, ad ?? null);
  }

  async findCategories() {
    const rows = await this.repo
      .createQueryBuilder("news")
      .select("DISTINCT TRIM(news.category)", "category")
      .where("news.category IS NOT NULL")
      .andWhere("TRIM(news.category) <> ''")
      .orderBy("category", "ASC")
      .getRawMany<{ category: string }>();

    return rows.map((row) => row.category);
  }

  async findOne(id: string) {
    // Получение новости по id
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException("News not found");
    return item;
  }

  async update(id: string, dto: UpdateNewsDto) {
    // Обновление новости
    const item = await this.findOne(id);

    // Дату не трогаем принципиально
    Object.assign(item, dto);

    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    return { success: true };
  }

  async pin(id: string) {
    // Закрепление новости, снимая закрепление с предыдущей закрепленной
    const saved = await this.repo.manager.transaction(async (manager) => {
      const item = await getNewsByIdOrFail(id, manager);

      if (item.isAds) {
        throw new BadRequestException("Рекламная новость не может быть закреплена");
      }

      await resetImportantNews(item.id, manager);

      item.isImportantNew = true;
      return manager.save(item);
    });
    return saved;
  }

  async unpin(id: string) {
    // Открепление новости без выбора новой закреплённой
    const item = await this.findOne(id);

    if (!item.isImportantNew) {
      return item;
    }

    item.isImportantNew = false;
    return this.repo.save(item);
  }

  /** Загрузка изображения для новости (admin). Возвращает URL. */
  async uploadNewsImage(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file?.buffer) {
      throw new BadRequestException("Файл не передан");
    }
    if (!(UPLOAD_IMAGE.allowedMimeTypes as readonly string[]).includes(file.mimetype)) {
      throw new BadRequestException("Недопустимый формат. Разрешены: PNG, JPEG, WebP, SVG, HEIF");
    }
    if (file.size > UPLOAD_IMAGE.maxSizeBytes) {
      throw new BadRequestException("Размер файла превышает 5 МБ");
    }

    const ext = file.originalname?.match(/\.[a-z]+$/i)?.[0] ?? ".jpg";
    const uploadResult = await this.storage.upload(
      {
        buffer: file.buffer,
        mimeType: file.mimetype,
        size: file.size,
        originalName: `news-${Date.now()}${ext}`,
      },
      {
        allowedMimeTypes: [...UPLOAD_IMAGE.allowedMimeTypes],
        maxSizeBytes: UPLOAD_IMAGE.maxSizeBytes,
        isPublic: true,
        pathPrefix: "news/admin-images",
      },
    );

    return { url: uploadResult.url };
  }
}
