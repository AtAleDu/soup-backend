import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Client } from "@entities/Client/client.entity";
import { Order, OrderStatus } from "@entities/Order/order.entity";
import { Company } from "@entities/Company/company.entity";
import { CompanyStatus } from "@entities/Company/company-status.enum";
import { OrderSuggestion } from "@entities/OrderSuggestion/order-suggestion.entity";
import { SuggestOrderDto } from "./dto/suggest-order.dto";

@Injectable()
export class SuggestOrderService {
  constructor(
    @InjectRepository(Client)
    private readonly clients: Repository<Client>,
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(OrderSuggestion)
    private readonly orderSuggestions: Repository<OrderSuggestion>,
  ) {}

  async suggest(orderId: number, userId: string, dto: SuggestOrderDto): Promise<{ success: boolean }> {
    const client = await this.clients.findOne({ where: { userId } });
    if (!client) {
      throw new ForbiddenException("Доступно только клиентам");
    }

    const order = await this.orders.findOne({
      where: { id: orderId, clientId: client.clientId },
    });
    if (!order) {
      throw new NotFoundException("Заказ не найден");
    }
    if (order.status !== OrderStatus.ACTIVE) {
      throw new BadRequestException("Предложить можно только активный заказ");
    }

    const company = await this.companies.findOne({
      where: { companyId: dto.companyId },
    });
    if (!company) {
      throw new NotFoundException("Компания не найдена");
    }
    if (company.status !== CompanyStatus.ACTIVE) {
      throw new BadRequestException("Нельзя предложить заказ этой компании");
    }

    const existing = await this.orderSuggestions.findOne({
      where: { orderId, companyId: dto.companyId },
    });
    if (existing) {
      throw new ConflictException("Вы уже предлагали этот заказ данной компании");
    }

    const suggestion = this.orderSuggestions.create({
      orderId,
      companyId: dto.companyId,
    });
    await this.orderSuggestions.save(suggestion);

    return { success: true };
  }
}
