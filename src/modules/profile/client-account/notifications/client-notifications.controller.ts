import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { ClientNotificationsService } from "./client-notifications.service";

@ApiTags("Profile")
@ApiBearerAuth()
@Controller("profile/client")
@UseGuards(JwtAuthGuard)
export class ClientNotificationsController {
  constructor(
    private readonly notificationsService: ClientNotificationsService,
  ) {}

  @ApiOperation({ summary: "Уведомления клиента (заказы)" })
  @Get("notifications")
  getNotifications(@Req() req: { user: { sub: string } }) {
    return this.notificationsService.getNotifications(req.user.sub);
  }
}
