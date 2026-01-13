import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CatalogFiltersService } from './catalog-filters.service'
import { CatalogFilterResponseDto } from './dto/catalog-filter-response.dto'

@ApiTags('CatalogFilters')
@Controller('catalog/filters')
export class CatalogFiltersController {
  constructor(private readonly service: CatalogFiltersService) {}

  @ApiOperation({ summary: 'Получить список фильтров каталога' })
  @ApiResponse({
    status: 200,
    description: 'Список фильтров каталога',
    type: [CatalogFilterResponseDto],
  })
  @Get()
  findAll(): Promise<CatalogFilterResponseDto[]> {
    return this.service.findAll()
  }
}
