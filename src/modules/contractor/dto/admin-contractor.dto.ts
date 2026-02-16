import { ApiProperty } from '@nestjs/swagger'
import { ContractorSubcategoryDto } from './contractor.dto'

export class AdminContractorTypeDto {
  @ApiProperty({ example: 'uuid' })
  id: string

  @ApiProperty({ example: 'Проектирование' })
  title: string

  @ApiProperty({ example: null, nullable: true })
  logoUrl: string | null

  @ApiProperty({ type: ContractorSubcategoryDto, isArray: true })
  subcategories: ContractorSubcategoryDto[]
}
