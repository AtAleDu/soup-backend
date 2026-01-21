import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RegionsService } from "./regions.service";
import { RegionResponseDto } from "./dto/region-response.dto";

@ApiTags("Regions")
@Controller("regions")
export class RegionsController {
  constructor(private readonly service: RegionsService) {}

  @ApiOperation({ summary: "Получить список регионов РФ" })
  @ApiResponse({
    status: 200,
    description: "Список регионов",
    type: [RegionResponseDto],
  })
  @Get()
  findAll(): RegionResponseDto[] {
    return this.service.findAll();
  }
}
