import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ContractorService } from '../contractor.service'
import { CreateContractorTypeDto } from '../dto/create-contractor.dto'
import { UpdateContractorTypeDto } from '../dto/update-contractor.dto'
import { AdminContractorTypeDto } from '../dto/admin-contractor.dto'
import { ContractorTypeDto } from '../dto/contractor.dto'

@ApiTags('Contractors')
@ApiBearerAuth()
@Controller('admin/contractors')
export class ContractorAdminController {
  constructor(private readonly service: ContractorService) {}

  // CREATE
  @ApiOperation({ summary: 'Создать подрядчика (admin)' })
  @ApiResponse({ status: 201, type: ContractorTypeDto })
  @Post()
  create(@Body() dto: CreateContractorTypeDto): Promise<ContractorTypeDto> {
    return this.service.create(dto)
  }

  // UPDATE
  @ApiOperation({ summary: 'Обновить подрядчика (admin)' })
  @ApiParam({ name: 'id', description: 'UUID' })
  @ApiResponse({ status: 200, type: ContractorTypeDto })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateContractorTypeDto,
  ): Promise<ContractorTypeDto> {
    return this.service.update(id, dto)
  }

  // DELETE
  @ApiOperation({ summary: 'Удалить подрядчика (admin)' })
  @ApiParam({ name: 'id', description: 'UUID' })
  @ApiResponse({ status: 200 })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id)
    return { success: true }
  }
}
