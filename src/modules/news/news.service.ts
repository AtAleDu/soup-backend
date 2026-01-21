import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NewsEntity } from "@entities/News/news.entity";
import { CreateNewsDto } from "./dto/create-news.dto";
import { UpdateNewsDto } from "./dto/update-news.dto";
import { RevalidationService } from "@infrastructure/revalidation/revalidation.service";
import { getNewsByIdOrFail, resetImportantNews, revalidateNewsPages } from "./news.utils";

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly repo: Repository<NewsEntity>,
    private readonly revalidationService: RevalidationService,
  ) {}

  async create(dto: CreateNewsDto) {
    // Создание новости
    const news = this.repo.create(dto);
    const saved = await this.repo.save(news);

    await revalidateNewsPages(this.revalidationService);

    return saved;
  }

  async findAll() {
    // Возвращаем новости в порядке публикации (свежие сверху)
    return this.repo.find({
      order: {
        createdAt: "DESC", // новые сверху
      },
    });
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

    const saved = await this.repo.save(item);

    await revalidateNewsPages(this.revalidationService, id);

    return saved;
  }

  async remove(id: string) {
    // Удаление новости
    const item = await this.findOne(id);

    await this.repo.remove(item);

    await revalidateNewsPages(this.revalidationService, id);

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

    await revalidateNewsPages(this.revalidationService, id);

    return saved;
  }

  async unpin(id: string) {
    // Открепление новости без выбора новой закреплённой
    const item = await this.findOne(id);

    if (!item.isImportantNew) {
      return item;
    }

    item.isImportantNew = false;
    const saved = await this.repo.save(item);

    await revalidateNewsPages(this.revalidationService, id);

    return saved;
  }
}