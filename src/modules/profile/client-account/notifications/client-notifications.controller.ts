import { Body, Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { ClientNotificationsService } from "./client-notifications.service";
import { NotificationReadService } from "../../notifications/notification-read.service";
import { MarkNotificationsReadDto } from "../../notifications/dto/mark-notifications-read.dto";

@ApiTags("Profile")
@ApiBearerAuth()
@Controller("profile/client")
@UseGuards(JwtAuthGuard)
export class ClientNotificationsController {
  constructor(
    private readonly notificationsService: ClientNotificationsService,
      private readonly notificationReadService: NotificationReadService,
  ) {}

  @ApiOperation({ summary: "Уведомления клиента (заказы)" })
  @Get("notifications")
  getNotifications(@Req() req: { user: { sub: string } }) {
    return this.notificationsService.getNotifications(req.user.sub);
  }

  @ApiOperation({
    summary: "Количество непрочитанных уведомлений клиента",
  })
  @Get("notifications/unread-count")
  async getUnreadCount(@Req() req: { user: { sub: string } }) {
    const userId = req.user.sub;
    const notifications =
      await this.notificationsService.getNotifications(userId);
    const allIds = notifications.map((item) => item.id);

    const count = await this.notificationReadService.getUnreadCount(
      userId,
      "client",
      allIds,
    );

    return { count };
  }

  @ApiOperation({
    summary:
      "Отметить уведомления клиента прочитанными (по списку или все сразу)",
  })
  @Patch("notifications/read")
  async markRead(
    @Req() req: { user: { sub: string } },
    @Body() dto: MarkNotificationsReadDto,
  ) {
    const userId = req.user.sub;
    const notifications =
      await this.notificationsService.getNotifications(userId);
    const allIds = notifications.map((item) => item.id);

    const idsToMark =
      dto.notificationIds && dto.notificationIds.length > 0
        ? dto.notificationIds.filter((id) => allIds.includes(id))
        : allIds;

    await this.notificationReadService.markAsRead(userId, "client", idsToMark);

    return { success: true };
  }
}
