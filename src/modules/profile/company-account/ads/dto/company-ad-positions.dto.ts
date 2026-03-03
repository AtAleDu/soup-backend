import { ApiProperty } from '@nestjs/swagger'

export class CompanyAdPositionDto {
  @ApiProperty({ example: 1 })
  id: number

  @ApiProperty({ example: 'banner' })
  code: string

  @ApiProperty({ example: 'Баннер' })
  title: string

  @ApiProperty({
    example: 'Позиция для баннерной рекламы',
    nullable: true,
  })
  description: string | null

  @ApiProperty({ example: 1 })
  sortOrder: number
}

export class CompanyAdPositionsResponseDto {
  @ApiProperty({ type: CompanyAdPositionDto, isArray: true })
  positions: CompanyAdPositionDto[]
}

