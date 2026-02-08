import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CompaniesService } from "./companies.service";

@ApiTags("Companies")
@Controller("companies")
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}

  // PUBLIC: список компаний для каталога
  @ApiOperation({ summary: "Получить список компаний" })
  @ApiResponse({ status: 200, description: "Список компаний" })
  @Get()
  findAll(@Query("filters") filters?: string) {
    return this.service.findAll(filters);
  }

  @ApiOperation({ summary: "Получить компанию по id" })
  @ApiResponse({ status: 200, description: "Компания найдена" })
  @ApiResponse({ status: 404, description: "Компания не найдена" })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
