import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guard";
import { Roles } from "@modules/auth/guards/roles.decorator";
import { CompanyServicesService } from "./company-services.service";
import { SaveCompanyServicesDto } from "./dto/save-company-services.dto";
import { CompanyServicesResponseDto } from "./dto/company-service.dto";
import { UpdateCompanyServicesModerationDto } from "./dto/update-company-services-moderation.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";

@ApiTags("Profile")
@ApiBearerAuth()
@Controller("profile/company/services")
@UseGuards(JwtAuthGuard)
export class CompanyServicesController {
  constructor(private readonly service: CompanyServicesService) {}

  @ApiOperation({ summary: "Получить услуги компании" })
  @ApiResponse({ status: 200, type: CompanyServicesResponseDto })
  @Get()
  get(@Req() req) {
    return this.service.getServices(req.user.sub);
  }

  @ApiOperation({ summary: "Сохранить услуги компании" })
  @ApiResponse({ status: 200 })
  @Post()
  save(@Req() req, @Body() dto: SaveCompanyServicesDto) {
    return this.service.saveServices(req.user.sub, dto);
  }

  @ApiOperation({ summary: "Загрузить фото или видео услуги" })
  @ApiResponse({ status: 200 })
  @Post("upload-image")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: memoryStorage(),
    }),
  )
  uploadImage(@Req() req, @UploadedFile() file) {
    return this.service.uploadServiceMedia(req.user.sub, file);
  }
}

@ApiTags("Admin moderation services")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin/moderation/services")
export class AdminModerationServicesController {
  constructor(private readonly service: CompanyServicesService) {}

  @ApiOperation({
    summary: "Список компаний с услугами в статусе moderation",
  })
  @ApiResponse({ status: 200, description: "Список компаний" })
  @Get("companies")
  getModerationCompanies() {
    return this.service.getModerationCompanies();
  }

  @ApiOperation({
    summary: "Получить услуги компании в статусе moderation",
  })
  @ApiResponse({ status: 200, description: "Данные компании и услуги" })
  @ApiResponse({ status: 404, description: "Компания не найдена" })
  @Get(":id")
  getModerationCompanyServices(@Param("id", ParseIntPipe) id: number) {
    return this.service.getModerationCompanyServices(id);
  }

  @ApiOperation({
    summary: "Одобрить или отклонить услуги компании на модерации",
  })
  @ApiResponse({ status: 200, description: "Статусы услуг обновлены" })
  @Patch(":id")
  moderateCompanyServices(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCompanyServicesModerationDto,
  ) {
    return this.service.moderateCompanyServices(id, dto);
  }
}
