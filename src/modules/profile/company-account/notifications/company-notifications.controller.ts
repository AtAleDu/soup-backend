import { Body, Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { CompanyNotificationsService } from "./company-notifications.service";
import { NotificationReadService } from "../../notifications/notification-read.service";
import { MarkNotificationsReadDto } from "../../notifications/dto/mark-notifications-read.dto";

@ApiTags("Profile")
@ApiBearerAuth()
@Controller("profile/company")
@UseGuards(JwtAuthGuard)
export class CompanyNotificationsController {
  constructor(
    private readonly notificationsService: CompanyNotificationsService,
      private readonly notificationReadService: NotificationReadService,
  ) {}

  @ApiOperation({
    summary: "Уведомления компании (блоги и услуги: одобренные / отклонённые)",
  })
  @Get("notifications")
  getNotifications(@Req() req: { user: { sub: string } }) {
    return this.notificationsService.getNotifications(req.user.sub);
  }

  @ApiOperation({
    summary: "Количество непрочитанных уведомлений компании",
  })
  @Get("notifications/unread-count")
  async getUnreadCount(@Req() req: { user: { sub: string } }) {
    const userId = req.user.sub;
    const notifications =
      await this.notificationsService.getNotifications(userId);
    const allIds = notifications.map((item) => item.id);

    const count = await this.notificationReadService.getUnreadCount(
      userId,
      "company",
      allIds,
    );

    return { count };
  }

  @ApiOperation({
    summary:
      "Отметить уведомления компании прочитанными (по списку или все сразу)",
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

    await this.notificationReadService.markAsRead(
      userId,
      "company",
      idsToMark,
    );

    return { success: true };
  }
}
