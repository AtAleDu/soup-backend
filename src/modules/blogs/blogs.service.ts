import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Blog, BlogStatus } from "@entities/Blog/blog.entity";

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly repo: Repository<Blog>,
  ) {}

  async findAll() {
    return this.repo.find({
      where: { status: BlogStatus.PUBLISHED },
      relations: { company: true },
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({
      where: { id, status: BlogStatus.PUBLISHED },
      relations: { company: true },
    });
    if (!item) throw new NotFoundException("Blog not found");
    return item;
  }
}