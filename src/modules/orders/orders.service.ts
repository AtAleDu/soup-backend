import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "@entities/Order/order.entity";
import { OrderStatus } from "@entities/Order/order.entity";
import { OrderResponse } from "@entities/OrderResponse/order-response.entity";
import { Company } from "@entities/Company/company.entity";
import type { ClientContact } from "@entities/Client/client.entity";
import type { ClientContactsResponseDto } from "./dto/client-contacts-response.dto";
import type { RespondOrderDto } from "./dto/respond-order.dto";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderResponse)
    private readonly orderResponses: Repository<OrderResponse>,
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
  ) {}

  /**
   * Список заказов всех пользователей по статусу (для каталога / откликов компаний).
   */
  async findAllByStatus(status: string = OrderStatus.ACTIVE): Promise<Order[]> {
    const allowed = Object.values(OrderStatus);
    const filterStatus = allowed.includes(status as (typeof allowed)[number])
      ? status
      : OrderStatus.ACTIVE;

    return this.orders.find({
      where: { status: filterStatus },
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Заказ по id из каталога заказов (для карточки заказа в каталоге).
   */
  async findOne(
    id: number,
    userId: string,
  ): Promise<(Order & { responsesCount: number; isResponded: boolean }) | null> {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) return null;

    const responsesCount = await this.orderResponses.count({
      where: { orderId: id },
    });
    const company = await this.companies.findOne({ where: { userId } });
    const isResponded =
      company != null
        ? (await this.orderResponses.count({
            where: { orderId: id, companyId: company.companyId },
          })) > 0
        : false;

    return {
      ...order,
      responsesCount,
      isResponded,
    };
  }

  async findClientContactsByOrderId(
    orderId: number,
  ): Promise<ClientContactsResponseDto> {
    const order = await this.orders.findOne({
      where: { id: orderId },
      relations: { client: { user: true } },
    });

    if (!order?.client) {
      throw new NotFoundException("Заказ не найден");
    }

    const rawContacts = Array.isArray(order.client.contacts)
      ? order.client.contacts
      : [];

    const findContact = (type: ClientContact["type"]): string | null => {
      const found = rawContacts.find(
        (item) =>
          item?.type === type &&
          typeof item.value === "string" &&
          item.value.trim() !== "",
      );
      return found?.value?.trim() ?? null;
    };

    const privacy = order.client.privacy_settings ?? {
      phone: false,
      email: false,
      social_links: false,
    };

    const phone = privacy.phone && !order.hidePhone ? findContact("phone") : null;
    const email = privacy.email
      ? findContact("email") ?? order.client.user?.email ?? null
      : null;
    const telegram = privacy.social_links ? findContact("telegram") : null;
    const max = privacy.social_links ? findContact("max") : null;

    const contacts: ClientContactsResponseDto["contacts"] = [
      ...(phone ? [{ type: "phone" as const, value: phone }] : []),
      ...(email ? [{ type: "email" as const, value: email }] : []),
      ...(telegram ? [{ type: "telegram" as const, value: telegram }] : []),
      ...(max ? [{ type: "max" as const, value: max }] : []),
    ];

    return {
      full_name: order.client.full_name ?? order.client.user?.name ?? null,
      city: order.client.city ?? order.region ?? null,
      avatar_url: order.client.avatar_url ?? null,
      contacts,
    };
  }

  async respond(orderId: number, userId: string, dto: RespondOrderDto) {
    const company = await this.companies.findOne({ where: { userId } });
    if (!company) {
      throw new ForbiddenException("Отклик доступен только компаниям");
    }

    const order = await this.orders.findOne({
      where: { id: orderId },
      relations: { client: true },
    });
    if (!order?.client) {
      throw new NotFoundException("Заказ не найден");
    }
    if (order.status !== OrderStatus.ACTIVE) {
      throw new BadRequestException("Откликнуться можно только на активный заказ");
    }
    if (order.client.userId === userId) {
      throw new ForbiddenException("Нельзя откликаться на собственный заказ");
    }

    const existingResponse = await this.orderResponses.findOne({
      where: { orderId, companyId: company.companyId },
    });
    if (existingResponse) {
      throw new ConflictException("Вы уже откликнулись на этот заказ");
    }

    const deadlineOffer = dto.deadlineOffer ? new Date(dto.deadlineOffer) : null;
    if (deadlineOffer && Number.isNaN(deadlineOffer.getTime())) {
      throw new BadRequestException("Некорректный формат deadlineOffer");
    }
    const priceFrom = dto.priceFrom ?? null;
    const priceTo = dto.priceTo ?? null;
    if (priceFrom != null && priceTo != null && priceFrom > priceTo) {
      throw new BadRequestException("priceFrom не может быть больше priceTo");
    }

    const response = this.orderResponses.create({
      orderId,
      companyId: company.companyId,
      message: dto.message?.trim() || null,
      priceFrom,
      priceTo,
      priceOffer: null,
      deadlineOffer,
    });
    const saved = await this.orderResponses.save(response);

    return {
      id: saved.id,
      orderId: saved.orderId,
      companyId: saved.companyId,
      status: saved.status,
      createdAt: saved.createdAt,
    };
  }
}
