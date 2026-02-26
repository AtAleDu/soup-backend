import {
  Body,
  Controller,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { EditClientAccountService } from "./edit-account.service";
import { UpdateClientAccountDto } from "../dto/update-client-account.dto";

@ApiTags("Profile")
@ApiBearerAuth()
@Controller("profile/client")
@UseGuards(JwtAuthGuard)
export class EditClientAccountController {
  constructor(private readonly service: EditClientAccountService) {}

  @ApiOperation({ summary: "Загрузить фото профиля клиента" })
  @Post("upload-avatar")
  @UseInterceptors(
    FileInterceptor("avatar", {
      storage: memoryStorage(),
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { avatar: { type: "string", format: "binary" } },
    },
  })
  uploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
    return this.service.uploadClientAvatar(req.user.sub, file);
  }

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
