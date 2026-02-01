import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Company } from "@entities/Company/company.entity";
import { Blog, BlogStatus } from "@entities/Blog/blog.entity";
import { RevalidationService } from "@infrastructure/revalidation/revalidation.service";
import { StorageService } from "@infrastructure/storage/storage.service";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";
import { revalidateBlogPages } from "./blog.utils";

export type CompanyBlogStatus = "all" | "published" | "drafts";

const BLOG_IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const BLOG_IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];

@Injectable()
export class CompanyBlogService {
  constructor(
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(Blog)
    private readonly blogs: Repository<Blog>,
    private readonly revalidationService: RevalidationService,
    private readonly storage: StorageService,
  ) {}

  private async getCompanyByUser(userId: string) {
    const company = await this.companies.findOne({ where: { userId } });
    if (!company) throw new NotFoundException("Компания не найдена");
    return company;
  }

  private async getBlogByCompanyId(userId: string, blogId: string) {
    const company = await this.getCompanyByUser(userId);
    const blog = await this.blogs.findOne({
      where: { id: blogId, companyId: company.companyId },
      relations: { company: true },
    });
    if (!blog) throw new NotFoundException("Блог не найден");
    return { blog, company };
  }

  private mapItem(item: Blog, company: Company) {
    const isPublished = item.status === BlogStatus.PUBLISHED;
    return {
      id: item.id,
      type: isPublished ? ("published" as const) : ("draft" as const),
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      contentBlocks: item.contentBlocks,
      createdAt: item.createdAt,
      isPinned: item.isPinned,
      companyName: item.company?.name ?? company.name,
      companyLogoUrl: item.company?.logo_url ?? company.logo_url ?? null,
    };
  }

  async getCompanyBlogs(userId: string, status: CompanyBlogStatus) {
    const company = await this.getCompanyByUser(userId);
    const companyId = company.companyId;

    if (status === "published") {
      const items = await this.blogs.find({
        where: { companyId, status: BlogStatus.PUBLISHED },
        relations: { company: true },
        order: { createdAt: "DESC" },
      });
      return items.map((item) => this.mapItem(item, company));
    }

    if (status === "drafts") {
      const items = await this.blogs.find({
        where: { companyId, status: BlogStatus.DRAFT },
        order: { createdAt: "DESC" },
      });
      return items.map((item) => this.mapItem(item, company));
    }

    const items = await this.blogs.find({
      where: { companyId },
      relations: { company: true },
      order: { createdAt: "DESC" },
    });
    return items
      .map((item) => this.mapItem(item, company))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  async getOne(userId: string, blogId: string) {
    const { blog, company } = await this.getBlogByCompanyId(userId, blogId);
    return this.mapItem(blog, company);
  }

  async create(userId: string, dto: CreateBlogDto) {
    const company = await this.getCompanyByUser(userId);
    const status = dto.publish === true ? BlogStatus.PUBLISHED : BlogStatus.DRAFT;
    const blog = this.blogs.create({
      companyId: company.companyId,
      title: dto.title,
      description: dto.description,
      imageUrl: dto.imageUrl,
      contentBlocks: dto.contentBlocks ?? null,
      status,
    });
    const saved = await this.blogs.save(blog);
    if (status === BlogStatus.PUBLISHED) {
      await revalidateBlogPages(this.revalidationService, saved.id);
    }
    return this.mapItem({ ...saved, company }, company);
  }

  async update(userId: string, blogId: string, dto: UpdateBlogDto) {
    const { blog, company } = await this.getBlogByCompanyId(userId, blogId);
    if (blog.status !== BlogStatus.DRAFT) {
      throw new BadRequestException("Редактировать можно только черновик");
    }
    if (dto.title !== undefined) blog.title = dto.title;
    if (dto.description !== undefined) blog.description = dto.description;
    if (dto.imageUrl !== undefined) blog.imageUrl = dto.imageUrl;
    if (dto.contentBlocks !== undefined) blog.contentBlocks = dto.contentBlocks;
    const saved = await this.blogs.save(blog);
    return this.mapItem({ ...saved, company }, company);
  }

  async delete(userId: string, blogId: string) {
    const { blog } = await this.getBlogByCompanyId(userId, blogId);
    const wasPublished = blog.status === BlogStatus.PUBLISHED;
    await this.blogs.remove(blog);
    if (wasPublished) {
      await revalidateBlogPages(this.revalidationService, blogId);
    }
    return { success: true };
  }

  async publish(userId: string, blogId: string) {
    const { blog, company } = await this.getBlogByCompanyId(userId, blogId);
    if (blog.status !== BlogStatus.DRAFT) {
      throw new BadRequestException("Опубликовать можно только черновик");
    }
    blog.status = BlogStatus.PUBLISHED;
    const saved = await this.blogs.save(blog);
    await revalidateBlogPages(this.revalidationService, saved.id);
    return this.mapItem({ ...saved, company }, company);
  }

  /** Универсальная загрузка изображения для блога: главное фото или изображение в блоке контента. Возвращает URL. */
  async uploadBlogImage(userId: string, file: Express.Multer.File): Promise<{ url: string }> {
    if (!file?.buffer) {
      throw new BadRequestException("Файл не передан");
    }
    if (!BLOG_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException("Недопустимый формат. Разрешены: PNG, JPEG, WebP");
    }
    if (file.size > BLOG_IMAGE_MAX_SIZE) {
      throw new BadRequestException("Размер файла превышает 5 МБ");
    }

    const company = await this.getCompanyByUser(userId);
    const ext = file.originalname?.match(/\.[a-z]+$/i)?.[0] ?? ".jpg";
    const uploadResult = await this.storage.upload(
      {
        buffer: file.buffer,
        mimeType: file.mimetype,
        size: file.size,
        originalName: `blog${ext}`,
      },
      {
        allowedMimeTypes: BLOG_IMAGE_MIME_TYPES,
        maxSizeBytes: BLOG_IMAGE_MAX_SIZE,
        isPublic: true,
        pathPrefix: `personal-account/company-account/blog-images/${company.companyId}`,
      },
    );

    return { url: uploadResult.url };
  }
}
