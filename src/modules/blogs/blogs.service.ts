import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Blog, BlogStatus } from "@entities/Blog/blog.entity";
import { resetPinnedBlog } from "./blogs.utils";

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
      order: { isPinned: "DESC", createdAt: "DESC" },
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

  async pin(id: string) {
    const blog = await this.repo.findOne({ where: { id }, relations: { company: true } });
    if (!blog) throw new NotFoundException("Blog not found");
    if (blog.status !== BlogStatus.PUBLISHED) {
      throw new BadRequestException("Закрепить можно только опубликованный блог");
    }
    return this.repo.manager.transaction(async (manager) => {
      await resetPinnedBlog(id, manager);
      blog.isPinned = true;
      return manager.save(blog);
    });
  }

  async unpin(id: string) {
    const blog = await this.repo.findOne({ where: { id }, relations: { company: true } });
    if (!blog) throw new NotFoundException("Blog not found");
    blog.isPinned = false;
    return this.repo.save(blog);
  }
}