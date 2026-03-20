import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Client } from "@entities/Client/client.entity";
import { ClientStatus } from "@entities/Client/client-status.enum";
import { Order, OrderStatus } from "@entities/Order/order.entity";
import { OrderResponse } from "@entities/OrderResponse/order-response.entity";
import { CompanyReview } from "@entities/CompanyReview/company-review.entity";
import { StorageService } from "@infrastructure/storage/storage.service";
import { UPLOAD_ORDER_FILE } from "@infrastructure/upload/upload-constraints";
import { CreateOrderDto } from "./dto/create-order.dto";

export type ClientOrderResponseItem = {
  id: number;
  orderId: number;
  companyId: number;
  companyName: string | null;
  companyLogoUrl: string | null;
  rating: number;
  reviewsCount: number;
  message: string | null;
  priceFrom: number | null;
  priceTo: number | null;
  status: string;
  createdAt: Date;
};

@Injectable()
export class CreateOrderService {
  constructor(
    @InjectRepository(Client)
    private readonly clients: Repository<Client>,
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderResponse)
    private readonly orderResponses: Repository<OrderResponse>,
    @InjectRepository(CompanyReview)
    private readonly companyReviews: Repository<CompanyReview>,
    private readonly storage: StorageService,
  ) {}

  private async getClientByUserId(userId: string): Promise<Client> {
    const client = await this.clients.findOne({ where: { userId } });
    if (!client) {
      throw new NotFoundException("Профиль клиента не найден");
    }
    return client;
  }

  async create(userId: string, dto: CreateOrderDto): Promise<Order> {
    const client = await this.getClientByUserId(userId);
    if (client.status !== ClientStatus.ACTIVE) {
      throw new ForbiddenException(
        "Создавать заказы могут только клиенты, которые прошли модерацию",
      );
    }

    const order = this.orders.create({
      clientId: client.clientId,
      title: dto.title.trim(),
      description: dto.description?.trim() ?? null,
      region: dto.location.trim(),
      price: dto.budget,
      category: dto.category.trim(),
      status: OrderStatus.MODERATION,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
      hidePhone: dto.hidePhone ?? false,
      fileUrls: dto.fileUrls ?? [],
    });

    return this.orders.save(order);
  }

  private async doUploadFile(
    file,
    pathPrefix: string,
  ): Promise<{ url: string }> {
    if (!file?.buffer) {
      throw new BadRequestException("Файл не передан");
    }
    if (
      !(UPLOAD_ORDER_FILE.allowedMimeTypes as readonly string[]).includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException(
        "Недопустимый формат. Разрешены: PNG, JPEG, WebP, SVG, HEIF, PDF, DOC, DOCX",
      );
    }
    if (file.size > UPLOAD_ORDER_FILE.maxSizeBytes) {
      throw new BadRequestException("Размер файла превышает 10 МБ");
    }

    const ext = file.originalname?.match(/\.[a-z]+$/i)?.[0] ?? ".bin";
    const uploadResult = await this.storage.upload(
      {
        buffer: file.buffer,
        mimeType: file.mimetype,
        size: file.size,
        originalName: `order${ext}`,
      },
      {
        allowedMimeTypes: [...UPLOAD_ORDER_FILE.allowedMimeTypes],
        maxSizeBytes: UPLOAD_ORDER_FILE.maxSizeBytes,
        isPublic: true,
        pathPrefix,
      },
    );

    return { url: uploadResult.url };
  }

  async uploadFile(userId: string | undefined, file): Promise<{ url: string }> {
    let pathPrefix = "personal-account/client-account/order-files/guest";
    if (userId != null) {
      const client = await this.getClientByUserId(userId);
      if (client.status !== ClientStatus.ACTIVE) {
        throw new ForbiddenException(
          "Загружать файлы к заказу могут только клиенты, которые прошли модерацию",
        );
      }
      pathPrefix = `personal-account/client-account/order-files/${client.clientId}`;
    }
    return this.doUploadFile(file, pathPrefix);
  }

  async findOne(
    userId: string,
    orderId: number,
  ): Promise<Order & { responsesCount: number }> {
    const client = await this.getClientByUserId(userId);
    const order = await this.orders.findOne({
      where: { id: orderId, clientId: client.clientId },
    });
    if (!order) {
      throw new NotFoundException("Заказ не найден");
    }
    const responsesCount = await this.orderResponses.count({
      where: { orderId },
    });
    return { ...order, responsesCount };
  }

  async findOrderResponses(
    userId: string,
    orderId: number,
  ): Promise<ClientOrderResponseItem[]> {
    const client = await this.getClientByUserId(userId);
    const order = await this.orders.findOne({
      where: { id: orderId, clientId: client.clientId },
    });
    if (!order) {
      throw new NotFoundException("Заказ не найден");
    }
    const responses = await this.orderResponses.find({
      where: { orderId },
      relations: { company: true },
      order: { createdAt: "DESC" },
    });
    if (responses.length === 0) return [];

    const companyIds = [...new Set(responses.map((r) => r.companyId))];
    const rawRatings = await this.companyReviews
      .createQueryBuilder("review")
      .select("review.companyId", "companyId")
      .addSelect("COALESCE(AVG(review.rating), 0)", "avgRating")
      .addSelect("COUNT(review.id)", "reviewsCount")
      .where("review.companyId IN (:...companyIds)", { companyIds })
      .groupBy("review.companyId")
      .getRawMany<{ companyId: number; avgRating: string; reviewsCount: string }>();

    const ratingByCompany = new Map<number, { rating: number; reviewsCount: number }>();
    for (const row of rawRatings) {
      ratingByCompany.set(row.companyId, {
        rating: Number(row.avgRating ?? 0),
        reviewsCount: Number(row.reviewsCount ?? 0),
      });
    }

    return responses.map((r) => {
      const { rating = 0, reviewsCount = 0 } =
        ratingByCompany.get(r.companyId) ?? {};
      return {
        id: r.id,
        orderId: r.orderId,
        companyId: r.companyId,
        companyName: r.company?.name ?? null,
        companyLogoUrl: r.company?.logo_url ?? null,
        rating: Number.isFinite(rating) ? rating : 0,
        reviewsCount: Number.isFinite(reviewsCount) ? reviewsCount : 0,
        message: r.message,
        priceFrom: r.priceFrom,
        priceTo: r.priceTo,
        status: r.status,
        createdAt: r.createdAt,
      };
    });
  }

  async findAll(userId: string, status?: string): Promise<Order[]> {
    const client = await this.getClientByUserId(userId);

    const filterByStatus = status && status !== "all" ? { status } : {};

    return this.orders.find({
      where: {
        clientId: client.clientId,
        ...filterByStatus,
      },
      order: { createdAt: "DESC" },
    });
  }

  async updateStatus(
    userId: string,
    orderId: number,
    status: string,
  ): Promise<Order> {
    const client = await this.getClientByUserId(userId);
    if (client.status !== ClientStatus.ACTIVE) {
      throw new ForbiddenException(
        "Менять статус заказа могут только клиенты, которые прошли модерацию",
      );
    }

    const order = await this.orders.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException("Заказ не найден");
    }
    if (order.clientId !== client.clientId) {
      throw new ForbiddenException("Нет доступа к этому заказу");
    }

    order.status = status;
    return this.orders.save(order);
  }
}
