import { Controller, Get } from "@nestjs/common";
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
  findAll() {
    return this.service.findAll();
  }
}
