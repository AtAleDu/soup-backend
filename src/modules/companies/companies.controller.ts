import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CompaniesService } from "./companies.service";

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
