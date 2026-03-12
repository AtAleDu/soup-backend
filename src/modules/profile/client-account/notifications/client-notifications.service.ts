import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import { Client } from "@entities/Client/client.entity";
import { ClientStatus } from "@entities/Client/client-status.enum";
import { Order, OrderStatus } from "@entities/Order/order.entity";
import { OrderResponse } from "@entities/OrderResponse/order-response.entity";
import { NotificationReadService } from "../../notifications/notification-read.service";

export type ClientNotificationItem = {
  id: string;
  entityType: "order" | "client_profile" | "order_response";
  entityId: string;
  entityTitle: string;
  status: "rejected" | "approved" | "response";
  rejectionReason?: string;
  createdAt: string;
  read: boolean;
};

type ClientNotificationItemRaw = Omit<ClientNotificationItem, "read">;

@Injectable()
export class ClientNotificationsService {
  constructor(
    @InjectRepository(Client)
    private readonly clients: Repository<Client>,
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderResponse)
    private readonly orderResponses: Repository<OrderResponse>,
    private readonly notificationReadService: NotificationReadService,
  ) {}

  private async getClientByUser(userId: string) {
    const client = await this.clients.findOne({ where: { userId } });
    if (!client) throw new NotFoundException("Профиль клиента не найден");
    return client;
  }

  async getNotifications(userId: string): Promise<ClientNotificationItem[]> {
    const client = await this.getClientByUser(userId);
    const clientId = client.clientId;

    const [ordersApproved, ordersRejected, orderResponses] = await Promise.all([
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
      this.orderResponses.find({
        where: { order: { clientId } },
        relations: { order: true },
        order: { createdAt: "DESC" },
      }),
    ]);

    const toDateStr = (d: Date | string) =>
      d instanceof Date ? d.toISOString() : String(d);

    const approvedItems = ordersApproved.map(
      (order) => ({
        id: String(order.id),
        entityType: "order" as const,
        entityId: String(order.id),
        entityTitle: order.title,
        status: "approved" as const,
        createdAt: toDateStr(order.approvedAt ?? order.updatedAt),
      }),
    );

    const rejectedItems = ordersRejected.map(
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

    const orderResponseItems: ClientNotificationItemRaw[] =
      orderResponses.map((r) => ({
        id: `order_response-${r.id}`,
        entityType: "order_response" as const,
        entityId: String(r.orderId),
        entityTitle: r.order?.title ?? "Заказ",
        status: "response" as const,
        createdAt: toDateStr(r.createdAt),
      }));

    const profileTitle =
      client.full_name?.trim() || "Профиль клиента";
    const clientProfileItem: ClientNotificationItemRaw | null =
      client.status === ClientStatus.ACTIVE
        ? {
            id: `client-profile-approved-${client.clientId}`,
            entityType: "client_profile",
            entityId: String(client.clientId),
            entityTitle: profileTitle,
            status: "approved",
            createdAt: toDateStr(client.updatedAt),
          }
        : client.status === ClientStatus.REJECTED
          ? {
              id: `client-profile-rejected-${client.clientId}`,
              entityType: "client_profile",
              entityId: String(client.clientId),
              entityTitle: profileTitle,
              status: "rejected",
              rejectionReason: client.rejection_reason ?? undefined,
              createdAt: toDateStr(client.updatedAt),
            }
          : null;

    const merged = [
      ...approvedItems,
      ...rejectedItems,
      ...orderResponseItems,
      ...(clientProfileItem ? [clientProfileItem] : []),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const readIds = await this.notificationReadService.getReadIds(
      userId,
      "client",
      merged.map((i) => i.id),
    );

    return merged.map((item) => ({
      ...item,
      read: readIds.has(item.id),
    }));
  }
}
