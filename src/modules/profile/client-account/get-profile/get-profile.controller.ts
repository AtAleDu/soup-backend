import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { GetClientProfileService } from "./get-profile.service";

@ApiTags("Profile")
@ApiBearerAuth()
@Controller("profile/client")
@UseGuards(JwtAuthGuard)
export class GetClientProfileController {
  constructor(private readonly service: GetClientProfileService) {}

  @ApiOperation({ summary: "Получить профиль клиента" })
  @Get()
  get(@Req() req) {
    return this.service.getProfile(req.user.sub);
  }
}
