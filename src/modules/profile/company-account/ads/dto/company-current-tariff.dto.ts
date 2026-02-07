import { ApiProperty } from '@nestjs/swagger'
import { CompanyTariffDto } from './company-tariffs.dto'

export class CompanyCurrentTariffResponseDto {
  @ApiProperty({ type: CompanyTariffDto })
  currentTariff: CompanyTariffDto | null

  @ApiProperty({ example: 0, nullable: true })
  daysLeft: number | null
}
