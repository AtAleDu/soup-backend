import { Body, Controller, Get, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { CompanyServicesService } from "./company-services.service";
import { SaveCompanyServicesDto } from "./dto/save-company-services.dto";
import { CompanyServicesResponseDto } from "./dto/company-service.dto";
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

  @ApiOperation({ summary: "Загрузить изображение услуги" })
  @ApiResponse({ status: 200 })
  @Post("upload-image")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: memoryStorage(),
    }),
  )
  uploadImage(@Req() req, @UploadedFile() file: Express.Multer.File) {
    return this.service.uploadServiceImage(req.user.sub, file);
  }
}
