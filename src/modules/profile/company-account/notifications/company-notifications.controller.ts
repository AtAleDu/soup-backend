import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { CompanyNotificationsService } from "./company-notifications.service";

@ApiTags("Profile")
@ApiBearerAuth()
@Controller("profile/company")
@UseGuards(JwtAuthGuard)
export class CompanyNotificationsController {
  constructor(
    private readonly notificationsService: CompanyNotificationsService,
  ) {}

  @ApiOperation({
    summary: "Уведомления компании (блоги и услуги: одобренные / отклонённые)",
  })
  @Get("notifications")
  getNotifications(@Req() req: { user: { sub: string } }) {
    return this.notificationsService.getNotifications(req.user.sub);
  }
}
