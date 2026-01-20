import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NewsEntity } from "@entities/News/news.entity";
import { CreateNewsDto } from "./dto/create-news.dto";
import { UpdateNewsDto } from "./dto/update-news.dto";
import { RevalidationService } from "@infrastructure/revalidation/revalidation.service";

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly repo: Repository<NewsEntity>,
    private readonly revalidationService: RevalidationService,
  ) {}

  async create(dto: CreateNewsDto) {
    const news = this.repo.create(dto);

    const saved = await this.repo.save(news);

    await this.revalidationService.revalidate("/news");

    return saved;
  }

  async findAll() {
    return this.repo.find({
      order: {
        createdAt: "DESC", // новые сверху
      },
    });
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException("News not found");
    return item;
  }

  async update(id: string, dto: UpdateNewsDto) {
    const item = await this.findOne(id);

    // 🔒 дату не трогаем принципиально
    Object.assign(item, dto);

    const saved = await this.repo.save(item);

    await this.revalidationService.revalidate("/news");

    return saved;
  }

  async remove(id: string) {
    const item = await this.findOne(id);

    await this.repo.remove(item);

    await this.revalidationService.revalidate("/news");

    return { success: true };
  }
}
