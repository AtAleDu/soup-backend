import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "@entities/Order/order.entity";
import { OrderStatus } from "@entities/Order/order.entity";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
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
  async findOne(id: number): Promise<Order | null> {
    return this.orders.findOne({ where: { id } });
  }
}
