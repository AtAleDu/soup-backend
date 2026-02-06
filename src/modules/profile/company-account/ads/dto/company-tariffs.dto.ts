import { ApiProperty } from '@nestjs/swagger'

export class CompanyTariffDto {
  @ApiProperty({ example: 1 })
  id: number

  @ApiProperty({ example: 'start' })
  name: string

  @ApiProperty({ example: 5000 })
  price: number

  @ApiProperty({ example: 30, nullable: true })
  durationDays: number | null

  @ApiProperty({ type: Object, nullable: true })
  features: Record<string, unknown> | null
}

export class CompanyTariffsResponseDto {
  @ApiProperty({ type: CompanyTariffDto, isArray: true })
  tariffs: CompanyTariffDto[]
}
