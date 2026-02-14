import { Body, Controller, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { EditClientAccountService } from "./edit-account.service";
import { UpdateClientAccountDto } from "../dto/update-client-account.dto";

@ApiTags("Profile")
@ApiBearerAuth()
@Controller("profile/client")
@UseGuards(JwtAuthGuard)
export class EditClientAccountController {
  constructor(private readonly service: EditClientAccountService) {}

  @ApiOperation({ summary: "Обновить профиль клиента" })
  @Post()
  update(@Req() req, @Body() dto: UpdateClientAccountDto) {
    return this.service.updateProfile(req.user.sub, dto);
  }

  @ApiOperation({ summary: "Частично обновить профиль клиента" })
  @Patch()
  patch(@Req() req, @Body() dto: UpdateClientAccountDto) {
    return this.service.updateProfile(req.user.sub, dto);
  }
}
