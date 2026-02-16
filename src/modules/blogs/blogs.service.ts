import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, In } from "typeorm";
import { Blog, BlogStatus } from "@entities/Blog/blog.entity";
import { BlogLike } from "@entities/BlogLike/blog-like.entity";
import { resetPinnedBlog } from "./blogs.utils";

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly repo: Repository<Blog>,
    @InjectRepository(BlogLike)
    private readonly likesRepo: Repository<BlogLike>,
    private readonly dataSource: DataSource,
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

    const blogIds = blogs.map(b => b.id);
    
    const refreshedBlogs = await this.repo.find({
      where: { id: In(blogIds) },
      select: ["id", "likeCount"],
    });
    const likesCountMap = new Map(refreshedBlogs.map(b => [b.id, b.likeCount || 0]));

    let userLikesSet = new Set<string>();
    if (userId) {
      const userLikes = await this.likesRepo.find({
        where: { userId, blogId: In(blogIds) },
        select: ["blogId"],
      });
      userLikesSet = new Set(userLikes.map(l => l.blogId));
    }

    return blogs.map(blog => ({
      ...blog,
      likesCount: likesCountMap.get(blog.id) || 0,
      likedByMe: userId ? userLikesSet.has(blog.id) : false,
    }));
  }

  async checkLikedByMe(blogId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
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

  async toggleLike(blogId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    const blog = await this.repo.findOne({ where: { id: blogId, status: BlogStatus.PUBLISHED } });
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
            const existingLike = await likesRepo.findOne({ where: { blogId, userId } });
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
      const updatedLike = await likesRepo.findOne({ where: { blogId, userId } });
      
      return {
        liked: !!updatedLike,
        likeCount: updatedBlog?.likeCount || 0,
      };
    });
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
