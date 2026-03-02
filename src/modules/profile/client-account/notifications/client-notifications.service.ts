import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import { Client } from "@entities/Client/client.entity";
import { Order, OrderStatus } from "@entities/Order/order.entity";

export type ClientNotificationItem = {
  id: string;
  entityType: "order";
  entityId: string;
  entityTitle: string;
  status: "rejected" | "approved";
  rejectionReason?: string;
  createdAt: string;
};

@Injectable()
export class ClientNotificationsService {
  constructor(
    @InjectRepository(Client)
    private readonly clients: Repository<Client>,
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
  ) {}

  private async getClientByUser(userId: string) {
    const client = await this.clients.findOne({ where: { userId } });
    if (!client) throw new NotFoundException("Профиль клиента не найден");
    return client;
  }

  async getNotifications(userId: string): Promise<ClientNotificationItem[]> {
    const client = await this.getClientByUser(userId);
    const clientId = client.clientId;

    const [ordersApproved, ordersRejected] = await Promise.all([
      this.orders.find({
        where: {
          clientId,
          status: OrderStatus.ACTIVE,
          approvedAt: Not(IsNull()),
        },
        order: { approvedAt: "DESC" },
      }),
      this.orders.find({
        where: {
          clientId,
          status: OrderStatus.COMPLETED,
          rejectionReason: Not(IsNull()),
        },
        order: { updatedAt: "DESC" },
      }),
    ]);

    const toDateStr = (d: Date | string) =>
      d instanceof Date ? d.toISOString() : String(d);

    const approvedItems: ClientNotificationItem[] = ordersApproved.map(
      (order) => ({
        id: String(order.id),
        entityType: "order" as const,
        entityId: String(order.id),
        entityTitle: order.title,
        status: "approved" as const,
        createdAt: toDateStr(order.approvedAt ?? order.updatedAt),
      }),
    );

    const rejectedItems: ClientNotificationItem[] = ordersRejected.map(
      (order) => ({
        id: String(order.id),
        entityType: "order" as const,
        entityId: String(order.id),
        entityTitle: order.title,
        status: "rejected" as const,
        rejectionReason: order.rejectionReason ?? undefined,
        createdAt: toDateStr(order.updatedAt),
      }),
    );

    const merged = [...approvedItems, ...rejectedItems].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return merged;
  }
}
