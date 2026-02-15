import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Client } from "@entities/Client/client.entity";
import { Order, OrderStatus } from "@entities/Order/order.entity";
import { StorageService } from "@infrastructure/storage/storage.service";
import { CreateOrderDto } from "./dto/create-order.dto";

const ORDER_FILE_MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ORDER_FILE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
];

@Injectable()
export class CreateOrderService {
  constructor(
    @InjectRepository(Client)
    private readonly clients: Repository<Client>,
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
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
    file: Express.Multer.File,
    pathPrefix: string,
  ): Promise<{ url: string }> {
    if (!file?.buffer) {
      throw new BadRequestException("Файл не передан");
    }
    if (!ORDER_FILE_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        "Недопустимый формат. Разрешены: PNG, JPEG, WebP, PDF",
      );
    }
    if (file.size > ORDER_FILE_MAX_SIZE) {
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
        allowedMimeTypes: ORDER_FILE_MIME_TYPES,
        maxSizeBytes: ORDER_FILE_MAX_SIZE,
        isPublic: true,
        pathPrefix,
      },
    );

    return { url: uploadResult.url };
  }

  async uploadFile(
    userId: string | undefined,
    file: Express.Multer.File,
  ): Promise<{ url: string }> {
    const pathPrefix =
      userId != null
        ? `personal-account/client-account/order-files/${(await this.getClientByUserId(userId)).clientId}`
        : "personal-account/client-account/order-files/guest";
    return this.doUploadFile(file, pathPrefix);
  }

  async findOne(userId: string, orderId: number): Promise<Order> {
    const client = await this.getClientByUserId(userId);
    const order = await this.orders.findOne({
      where: { id: orderId, clientId: client.clientId },
    });
    if (!order) {
      throw new NotFoundException("Заказ не найден");
    }
    return order;
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
