import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CompaniesService } from "./companies.service";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guard";
import { Roles } from "@modules/auth/guards/roles.decorator";
import { UpdateCompanyModerationDto } from "./dto/update-company-moderation.dto";

@ApiTags("Companies")
@Controller("companies")
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}

  // PUBLIC: список компаний для каталога
  @ApiOperation({ summary: "Получить список компаний" })
  @ApiQuery({ name: "sort", required: false, enum: ["default", "rating", "reviews"], description: "Сортировка: default - по умолчанию, rating - по рейтингу, reviews - по количеству отзывов" })
  @ApiResponse({ status: 200, description: "Список компаний" })
  @Get()
  findAll(@Query("filters") filters?: string, @Query("regions") regions?: string, @Query("sort") sort?: string) {
    return this.service.findAll(filters, regions, sort);
  }

  @ApiOperation({ summary: "Получить компанию по id" })
  @ApiResponse({ status: 200, description: "Компания найдена" })
  @ApiResponse({ status: 404, description: "Компания не найдена" })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}

@ApiTags("Admin moderation companies")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin/moderation/companies")
export class AdminModerationCompaniesController {
  constructor(private readonly service: CompaniesService) {}

  @ApiOperation({
    summary: "Список компаний в статусе moderation",
  })
  @ApiResponse({ status: 200, description: "Список компаний" })
  @Get()
  getModerationCompanies() {
    return this.service.getModerationCompanies();
  }

  @ApiOperation({
    summary: "Данные компании в статусе moderation",
  })
  @ApiResponse({ status: 200, description: "Данные компании" })
  @ApiResponse({ status: 404, description: "Компания не найдена" })
  @Get(":id")
  getModerationCompany(@Param("id", ParseIntPipe) id: number) {
    return this.service.getModerationCompany(id);
  }

  @ApiOperation({
    summary: "Одобрить или отклонить компанию на модерации",
  })
  @ApiResponse({ status: 200, description: "Статус компании обновлен" })
  @Patch(":id")
  moderateCompany(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCompanyModerationDto,
  ) {
    return this.service.moderateCompany(id, dto);
  }
}
