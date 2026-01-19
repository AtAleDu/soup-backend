import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ContractorService } from './contractor.service'
import { ContractorTypeDto } from './dto/contractor.dto'

@ApiTags('Contractors')
@Controller('contractors')
export class ContractorController {
  constructor(private readonly service: ContractorService) {}

  @ApiOperation({ summary: 'Получить подрядчиков' })
  @ApiResponse({ status: 200, type: ContractorTypeDto, isArray: true })
  @Get()
  getAll(): Promise<ContractorTypeDto[]> {
    return this.service.getTypes()
  }

  @ApiOperation({ summary: 'Получить подрядчика по id' })
  @ApiResponse({ status: 200, type: ContractorTypeDto })
  @Get(':id')
  @Get(':id')
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getOne(id)
  }
}
