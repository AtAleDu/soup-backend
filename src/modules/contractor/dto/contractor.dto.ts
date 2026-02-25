import { ApiProperty } from '@nestjs/swagger'

export class ContractorSubcategoryDto {
  @ApiProperty({ example: 'Архитектура' })
  title: string
}

export class ContractorTypeDto {
  @ApiProperty({ example: 'Проектирование' })
  title: string

  @ApiProperty({ example: null, nullable: true })
  logoUrl: string | null

  @ApiProperty({ type: ContractorSubcategoryDto, isArray: true })
  subcategories: ContractorSubcategoryDto[]
}
