import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Company } from "@entities/Company/company.entity";
import { CompanyReview } from "@entities/CompanyReview/company-review.entity";
import { Order } from "@entities/Order/order.entity";
import { OrderResponse } from "@entities/OrderResponse/order-response.entity";
import { Repository } from "typeorm";

export type CompanyOrdersStatus = "responded" | "archive";

@Injectable()
export class CompanyOrdersService {
  constructor(
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(CompanyReview)
    private readonly companyReviews: Repository<CompanyReview>,
    @InjectRepository(OrderResponse)
    private readonly orderResponses: Repository<OrderResponse>,
  ) {}

  private async getCompanyByUserId(userId: string): Promise<Company> {
    const company = await this.companies.findOne({ where: { userId } });
    if (!company) {
      throw new NotFoundException("Компания не найдена");
    }
    return company;
  }

  async findOrdersByStatus(
    userId: string,
    status: string | undefined,
  ): Promise<Order[]> {
    const normalizedStatus: CompanyOrdersStatus =
      status === "archive" ? "archive" : "responded";

    if (normalizedStatus === "archive") {
      return [];
    }

    const company = await this.getCompanyByUserId(userId);
    const responses = await this.orderResponses.find({
      where: { companyId: company.companyId },
      relations: { order: true },
      order: { createdAt: "DESC" },
    });

    return responses
      .map((response) => response.order)
      .filter((order): order is Order => order != null);
  }

  async findMyResponseByOrderId(userId: string, orderId: number) {
    const company = await this.getCompanyByUserId(userId);
    const response = await this.orderResponses.findOne({
      where: { companyId: company.companyId, orderId },
      relations: { company: true },
    });

    if (!response) {
      throw new NotFoundException("Отклик не найден");
    }

    const rawRating = await this.companyReviews
      .createQueryBuilder("review")
      .select("COALESCE(AVG(review.rating), 0)", "avgRating")
      .addSelect("COUNT(review.id)", "reviewsCount")
      .where("review.companyId = :companyId", { companyId: company.companyId })
      .getRawOne<{ avgRating: string; reviewsCount: string }>();

    const rating = Number(rawRating?.avgRating ?? 0);
    const reviewsCount = Number(rawRating?.reviewsCount ?? 0);

    return {
      id: response.id,
      orderId: response.orderId,
      companyId: response.companyId,
      companyName: response.company?.name ?? null,
      companyLogoUrl: response.company?.logo_url ?? null,
      rating: Number.isFinite(rating) ? rating : 0,
      reviewsCount: Number.isFinite(reviewsCount) ? reviewsCount : 0,
      message: response.message,
      priceFrom: response.priceFrom,
      priceTo: response.priceTo,
      status: response.status,
      createdAt: response.createdAt,
    };
  }

  async cancelMyResponse(userId: string, orderId: number) {
    const company = await this.getCompanyByUserId(userId);
    const response = await this.orderResponses.findOne({
      where: { companyId: company.companyId, orderId },
    });

    if (!response) {
      throw new NotFoundException("Отклик не найден");
    }

    await this.orderResponses.remove(response);

    return {
      id: response.id,
      orderId: response.orderId,
      companyId: response.companyId,
      canceled: true,
    };
  }
}
