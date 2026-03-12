import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import {
  NotificationContext,
  NotificationRead,
} from "@entities/NotificationRead/notification-read.entity";

@Injectable()
export class NotificationReadService {
  constructor(
    @InjectRepository(NotificationRead)
    private readonly notificationReads: Repository<NotificationRead>,
  ) {}

  async getReadIds(
    userId: string,
    context: NotificationContext,
    notificationIds: string[],
  ): Promise<Set<string>> {
    if (notificationIds.length === 0) {
      return new Set();
    }

    const readRows = await this.notificationReads.find({
      where: {
        userId,
        context,
        notificationId: In(notificationIds),
      },
      select: ["notificationId"],
    });

    return new Set(readRows.map((row) => row.notificationId));
  }

  async getUnreadCount(
    userId: string,
    context: NotificationContext,
    notificationIds: string[],
  ): Promise<number> {
    if (notificationIds.length === 0) {
      return 0;
    }

    const readIds = await this.getReadIds(userId, context, notificationIds);
    return notificationIds.filter((id) => !readIds.has(id)).length;
  }

  async markAsRead(
    userId: string,
    context: NotificationContext,
    notificationIds: string[],
  ): Promise<void> {
    const uniqueIds = Array.from(new Set(notificationIds));
    if (uniqueIds.length === 0) {
      return;
    }

    await this.notificationReads
      .createQueryBuilder()
      .insert()
      .into(NotificationRead)
      .values(
        uniqueIds.map((id) => ({
          userId,
          context,
          notificationId: id,
        })),
      )
      .orIgnore()
      .execute();
  }
}

