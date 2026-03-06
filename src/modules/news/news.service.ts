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

  private mixNewsWithAds(news: NewsEntity[], ads: Ad[]) {
    const mixed: Array<{ kind: "news"; data: NewsEntity } | { kind: "ad"; data: any }> = [];
    const chunkSize = 3;
    let adCursor = 0;

    for (let i = 0; i < news.length; i += chunkSize) {
      const chunk = news.slice(i, i + chunkSize);
      for (const item of chunk) {
        mixed.push({ kind: "news", data: item });
      }

      if (adCursor < ads.length) {
        mixed.push(this.mapMixedAd(ads[adCursor]));
        adCursor += 1;
      }
    }

    return mixed;
  }

  async findAll(time?: string, badge?: string, withAds?: boolean, adsPlacement?: string) {
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

    if (badge) {
      qb.andWhere("news.category = :badge", { badge });
    }

    const list = await qb.getMany();
    if (!withAds) {
      return list;
    }

    const adLimit = Math.max(1, Math.ceil(list.length / 3));
    const placement = adsPlacement || "news_inline";
    const ads = await this.ads
      .createQueryBuilder("ad")
      .where("ad.status = :status", { status: AdStatus.ACTIVE })
      .andWhere("ad.is_active = true")
      .andWhere("ad.ad_kind = :adKind", { adKind: AdKind.BANNER })
      .andWhere("ad.placement = :placement", { placement })
      .andWhere("(ad.start_date IS NULL OR ad.start_date <= CURRENT_DATE)")
      .andWhere("(ad.end_date IS NULL OR ad.end_date >= CURRENT_DATE)")
      .orderBy("RANDOM()")
      .limit(adLimit)
      .getMany();

    return this.mixNewsWithAds(list, ads);
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
      throw new BadRequestException("Недопустимый формат. Разрешены: PNG, JPEG, WebP, SVG");
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
