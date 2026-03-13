import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Company } from "@entities/Company/company.entity";
import { CompanyStatus } from "@entities/Company/company-status.enum";
import { NewsEntity } from "@entities/News/news.entity";
import { Blog, BlogStatus } from "@entities/Blog/blog.entity";
import { Order } from "@entities/Order/order.entity";
import { OrderStatus } from "@entities/Order/order.entity";
import { Contest } from "@entities/Contest/contest.entity";
import type {
  GlobalSearchResponseDto,
  GlobalSearchItemDto,
} from "./dto/global-search-response.dto";

const LIMIT_PER_TYPE = 5;

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(NewsEntity)
    private readonly news: Repository<NewsEntity>,
    @InjectRepository(Blog)
    private readonly blogs: Repository<Blog>,
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(Contest)
    private readonly contests: Repository<Contest>,
  ) {}

  async search(q: string): Promise<GlobalSearchResponseDto> {
    const term = (q ?? "").trim();
    if (term.length < 2) {
      return this.empty();
    }
    const pattern = `%${term}%`;

    const [companies, news, blogs, orders, contests] = await Promise.all([
      this.searchCompanies(pattern),
      this.searchNews(pattern),
      this.searchBlogs(pattern),
      this.searchOrders(pattern),
      this.searchContests(pattern),
    ]);

    return {
      companies,
      news,
      blogs,
      orders,
      contests,
    };
  }

  private empty(): GlobalSearchResponseDto {
    return {
      companies: [],
      news: [],
      blogs: [],
      orders: [],
      contests: [],
    };
  }

  private async searchCompanies(pattern: string): Promise<GlobalSearchItemDto[]> {
    const rows = await this.companies
      .createQueryBuilder("c")
      .select("c.companyId", "id")
      .addSelect("c.name", "title")
      .where("c.status = :status", { status: CompanyStatus.ACTIVE })
      .andWhere("c.name ILIKE :pattern", { pattern })
      .orderBy("c.createdAt", "DESC")
      .limit(LIMIT_PER_TYPE)
      .getRawMany<{ id: number; title: string }>();
    return rows.map((r) => ({ id: r.id, title: r.title }));
  }

  private async searchNews(pattern: string): Promise<GlobalSearchItemDto[]> {
    const rows = await this.news
      .createQueryBuilder("n")
      .select("n.id", "id")
      .addSelect("n.title", "title")
      .where("n.title ILIKE :pattern", { pattern })
      .orderBy("n.createdAt", "DESC")
      .limit(LIMIT_PER_TYPE)
      .getRawMany<{ id: string; title: string }>();
    return rows.map((r) => ({ id: r.id, title: r.title }));
  }

  private async searchBlogs(pattern: string): Promise<GlobalSearchItemDto[]> {
    const rows = await this.blogs
      .createQueryBuilder("b")
      .select("b.id", "id")
      .addSelect("b.title", "title")
      .where("b.status = :status", { status: BlogStatus.PUBLISHED })
      .andWhere("b.title ILIKE :pattern", { pattern })
      .orderBy("b.createdAt", "DESC")
      .limit(LIMIT_PER_TYPE)
      .getRawMany<{ id: string; title: string }>();
    return rows.map((r) => ({ id: r.id, title: r.title }));
  }

  private async searchOrders(pattern: string): Promise<GlobalSearchItemDto[]> {
    const rows = await this.orders
      .createQueryBuilder("o")
      .select("o.id", "id")
      .addSelect("o.title", "title")
      .where("o.status = :status", { status: OrderStatus.ACTIVE })
      .andWhere("o.title ILIKE :pattern", { pattern })
      .orderBy("o.createdAt", "DESC")
      .limit(LIMIT_PER_TYPE)
      .getRawMany<{ id: number; title: string }>();
    return rows.map((r) => ({ id: r.id, title: r.title }));
  }

  private async searchContests(
    pattern: string,
  ): Promise<GlobalSearchItemDto[]> {
    const rows = await this.contests
      .createQueryBuilder("c")
      .select("c.id", "id")
      .addSelect("c.title", "title")
      .where("c.title ILIKE :pattern", { pattern })
      .orderBy("c.startDate", "DESC")
      .limit(LIMIT_PER_TYPE)
      .getRawMany<{ id: number; title: string }>();
    return rows.map((r) => ({ id: r.id, title: r.title }));
  }
}
