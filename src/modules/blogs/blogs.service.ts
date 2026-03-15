import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, In } from "typeorm";
import { Blog, BlogStatus } from "@entities/Blog/blog.entity";
import { BlogLike } from "@entities/BlogLike/blog-like.entity";
import { Client } from "@entities/Client/client.entity";
import { ClientStatus } from "@entities/Client/client-status.enum";
import { Company } from "@entities/Company/company.entity";
import { CompanyStatus } from "@entities/Company/company-status.enum";
import { StorageService } from "@infrastructure/storage/storage.service";
import { UPLOAD_IMAGE } from "@infrastructure/upload/upload-constraints";
import { resetPinnedBlog } from "./blogs.utils";
import { UpdateBlogDto } from "./dto/update-blog.dto";

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly repo: Repository<Blog>,
    @InjectRepository(BlogLike)
    private readonly likesRepo: Repository<BlogLike>,
    @InjectRepository(Client)
    private readonly clients: Repository<Client>,
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    private readonly dataSource: DataSource,
    private readonly storage: StorageService,
  ) {}

  async findAll(companyId?: string, userId?: string) {
    const parsedCompanyId = companyId ? Number(companyId) : undefined;
    const hasCompanyId = Number.isFinite(parsedCompanyId);

    const blogs = await this.repo.find({
      where: {
        status: BlogStatus.PUBLISHED,
        ...(hasCompanyId ? { companyId: parsedCompanyId } : {}),
      },
      relations: { company: true },
      order: hasCompanyId
        ? { pinnedByCompany: "DESC", createdAt: "DESC" }
        : { isPinned: "DESC", createdAt: "DESC" },
    });

    return this.enrichWithLikes(blogs, userId);
  }

  async findOne(id: string, userId?: string) {
    const item = await this.repo.findOne({
      where: { id, status: BlogStatus.PUBLISHED },
      relations: { company: true },
    });
    if (!item) throw new NotFoundException("Blog not found");

    const [enriched] = await this.enrichWithLikes([item], userId);
    return enriched;
  }

  async enrichWithLikes(blogs: Blog[], userId?: string) {
    if (blogs.length === 0) return blogs;

    const blogIds = blogs.map((b) => b.id);

    const refreshedBlogs = await this.repo.find({
      where: { id: In(blogIds) },
      select: ["id", "likeCount"],
    });
    const likesCountMap = new Map(
      refreshedBlogs.map((b) => [b.id, b.likeCount || 0]),
    );

    let userLikesSet = new Set<string>();
    if (userId) {
      const userLikes = await this.likesRepo.find({
        where: { userId, blogId: In(blogIds) },
        select: ["blogId"],
      });
      userLikesSet = new Set(userLikes.map((l) => l.blogId));
    }

    return blogs.map((blog) => ({
      ...blog,
      likesCount: likesCountMap.get(blog.id) || 0,
      likedByMe: userId ? userLikesSet.has(blog.id) : false,
    }));
  }

  async checkLikedByMe(
    blogId: string,
    userId: string,
  ): Promise<{ liked: boolean; likeCount: number }> {
    const blog = await this.repo.findOne({
      where: { id: blogId, status: BlogStatus.PUBLISHED },
      select: ["id", "likeCount"],
    });
    if (!blog) throw new NotFoundException("Blog not found");

    const like = await this.likesRepo.findOne({ where: { blogId, userId } });
    return {
      liked: !!like,
      likeCount: blog.likeCount || 0,
    };
  }

  async toggleLike(
    blogId: string,
    userId: string,
    role: string,
  ): Promise<{ liked: boolean; likeCount: number }> {
    if (role !== "ADMIN") {
      const client = await this.clients.findOne({ where: { userId } });
      if (client?.status === ClientStatus.ACTIVE) {
        // allowed
      } else {
        const company = await this.companies.findOne({ where: { userId } });
        if (company?.status !== CompanyStatus.ACTIVE) {
          throw new ForbiddenException(
            "Лайкать блоги могут только пользователи, которые прошли модерацию",
          );
        }
      }
    }

    const blog = await this.repo.findOne({
      where: { id: blogId, status: BlogStatus.PUBLISHED },
    });
    if (!blog) throw new NotFoundException("Blog not found");

    return this.dataSource.transaction(async (manager) => {
      const likesRepo = manager.getRepository(BlogLike);
      const blogRepo = manager.getRepository(Blog);

      const deleteResult = await likesRepo.delete({ blogId, userId });

      if (deleteResult.affected && deleteResult.affected > 0) {
        await blogRepo
          .createQueryBuilder()
          .update(Blog)
          .set({ likeCount: () => "GREATEST(like_count - 1, 0)" })
          .where("id = :id", { id: blogId })
          .execute();
      } else {
        try {
          const like = likesRepo.create({ blogId, userId });
          await likesRepo.save(like);
          await blogRepo
            .createQueryBuilder()
            .update(Blog)
            .set({ likeCount: () => "like_count + 1" })
            .where("id = :id", { id: blogId })
            .execute();
        } catch (error: any) {
          if (error.code === "23505") {
            const existingLike = await likesRepo.findOne({
              where: { blogId, userId },
            });
            if (existingLike) {
              await likesRepo.remove(existingLike);
              await blogRepo
                .createQueryBuilder()
                .update(Blog)
                .set({ likeCount: () => "GREATEST(like_count - 1, 0)" })
                .where("id = :id", { id: blogId })
                .execute();
            }
          } else {
            throw error;
          }
        }
      }

      const updatedBlog = await blogRepo.findOne({
        where: { id: blogId },
        select: ["id", "likeCount"],
      });
      const updatedLike = await likesRepo.findOne({
        where: { blogId, userId },
      });

      return {
        liked: !!updatedLike,
        likeCount: updatedBlog?.likeCount || 0,
      };
    });
  }

  async pin(id: string) {
    const blog = await this.repo.findOne({
      where: { id },
      relations: { company: true },
    });
    if (!blog) throw new NotFoundException("Blog not found");
    if (blog.status !== BlogStatus.PUBLISHED) {
      throw new BadRequestException(
        "Закрепить можно только опубликованный блог",
      );
    }
    return this.repo.manager.transaction(async (manager) => {
      await resetPinnedBlog(id, manager);
      blog.isPinned = true;
      return manager.save(blog);
    });
  }

  async unpin(id: string) {
    const blog = await this.repo.findOne({
      where: { id },
      relations: { company: true },
    });
    if (!blog) throw new NotFoundException("Blog not found");
    blog.isPinned = false;
    return this.repo.save(blog);
  }

  async uploadBlogImageForAdmin(
    file: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file?.buffer) {
      throw new BadRequestException("Файл не передан");
    }
    if (
      !(UPLOAD_IMAGE.allowedMimeTypes as readonly string[]).includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException(
        "Недопустимый формат. Разрешены: PNG, JPEG, WebP, SVG, HEIF",
      );
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
        originalName: `blog-admin-${Date.now()}${ext}`,
      },
      {
        allowedMimeTypes: [...UPLOAD_IMAGE.allowedMimeTypes],
        maxSizeBytes: UPLOAD_IMAGE.maxSizeBytes,
        isPublic: true,
        pathPrefix: "blogs/admin-images",
      },
    );
    return { url: uploadResult.url };
  }

  async findAllForAdmin(status?: BlogStatus) {
    const where = status ? { status } : { status: BlogStatus.PUBLISHED };
    return this.repo.find({
      where,
      relations: { company: true },
      order: { createdAt: "DESC" },
    });
  }

  async findOneForAdmin(id: string) {
    const blog = await this.repo.findOne({
      where: { id },
      relations: { company: true },
    });
    if (!blog) throw new NotFoundException("Blog not found");
    return blog;
  }

  async updateForAdmin(id: string, dto: UpdateBlogDto) {
    const blog = await this.repo.findOne({
      where: { id },
      relations: { company: true },
    });
    if (!blog) throw new NotFoundException("Blog not found");
    if (dto.status !== undefined) {
      blog.status = dto.status;
      if (dto.status === BlogStatus.PUBLISHED) blog.approvedAt = new Date();
    }
    if (dto.rejectionReason !== undefined)
      blog.rejectionReason = dto.rejectionReason;
    if (dto.title !== undefined) blog.title = dto.title;
    if (dto.description !== undefined) blog.description = dto.description;
    if (dto.imageUrl !== undefined) blog.imageUrl = dto.imageUrl;
    if (dto.contentBlocks !== undefined) blog.contentBlocks = dto.contentBlocks;
    return this.repo.save(blog);
  }

  async removeForAdmin(id: string) {
    const blog = await this.repo.findOne({ where: { id } });
    if (!blog) throw new NotFoundException("Blog not found");
    await this.repo.remove(blog);
    return { success: true };
  }

  async findTopLiked(limit: number = 5, userId?: string) {
    const blogs = await this.repo.find({
      where: { status: BlogStatus.PUBLISHED },
      relations: { company: true },
      order: { likeCount: "DESC", createdAt: "DESC" },
      take: limit,
    });

    return this.enrichWithLikes(blogs, userId);
  }
}
