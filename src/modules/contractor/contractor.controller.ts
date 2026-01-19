import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ContractorService } from './contractor.service'
import { ContractorTypeDto } from './dto/contractor-type.dto'

@ApiTags('Contractors')
@Controller('contractors')
export class ContractorController {
  constructor(private readonly service: ContractorService) {}

  @ApiOperation({ summary: 'Получить подрядчиков' })
  @ApiResponse({
    status: 200,
    type: ContractorTypeDto,
    isArray: true,
  })
  @Get()
  getAll(): Promise<ContractorTypeDto[]> {
    return this.service.getTypes()
  }
}

