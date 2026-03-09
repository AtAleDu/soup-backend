import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import { Client } from "@entities/Client/client.entity";
import { ClientStatus } from "@entities/Client/client-status.enum";
import { Order, OrderStatus } from "@entities/Order/order.entity";

export type ClientNotificationItem = {
  id: string;
  entityType: "order" | "client_profile";
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

    const profileTitle =
      client.full_name?.trim() || "Профиль клиента";
    const clientProfileItem: ClientNotificationItem | null =
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
      ...(clientProfileItem ? [clientProfileItem] : []),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return merged;
  }
}
