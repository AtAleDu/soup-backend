import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Client } from "@entities/Client/client.entity";
import { Order } from "@entities/Order/order.entity";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class CreateOrderService {
  constructor(
    @InjectRepository(Client)
    private readonly clients: Repository<Client>,
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
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
      deadline: dto.deadline ? new Date(dto.deadline) : null,
    });

    return this.orders.save(order);
  }

  async findAll(userId: string, status?: string): Promise<Order[]> {
    const client = await this.getClientByUserId(userId);

    const filterByStatus =
      status && status !== "all" ? { status } : {};

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
