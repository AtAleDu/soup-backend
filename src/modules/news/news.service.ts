import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NewsEntity } from "@entities/News/news.entity";
import { CreateNewsDto } from "./dto/create-news.dto";
import { UpdateNewsDto } from "./dto/update-news.dto";
import { getNewsByIdOrFail, resetImportantNews } from "./news.utils";

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly repo: Repository<NewsEntity>,
  ) {}

  async create(dto: CreateNewsDto) {
    const news = this.repo.create(dto);
    return this.repo.save(news);
  }

  async findAll(time?: string, badge?: string) {
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
      qb.andWhere("(news.category = :badge OR news.isAds = :isAds)", {
        badge,
        isAds: true,
      });
    }

    return qb.getMany();
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
}