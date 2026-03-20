import { ApiProperty } from '@nestjs/swagger'

export type CompanyAdsStatisticsRange = 'week' | 'month' | 'period'

export class CompanyAdsStatisticsSummaryDto {
  @ApiProperty({ example: 0 })
  profileTransitions: number

  @ApiProperty({ example: 0 })
  bannerClicks: number

  @ApiProperty({ example: 0 })
  newsClicks: number

  @ApiProperty({ example: 0 })
  callClicks: number
}

export class CompanyAdsStatisticsSourceDto {
  @ApiProperty({ example: 'banner' })
  placement: string

  @ApiProperty({ example: 0 })
  clicksCount: number
}

export class CompanyAdsStatisticsItemDto {
  @ApiProperty({ example: 1 })
  id: number

  @ApiProperty({ example: 'Some title', nullable: true })
  title: string | null

  @ApiProperty({ example: 'banner', nullable: true })
  placement: string | null

  @ApiProperty({ example: 0 })
  clicksCount: number
}

export class CompanyAdsStatisticsResponseDto {
  @ApiProperty({ type: CompanyAdsStatisticsSummaryDto })
  summary: CompanyAdsStatisticsSummaryDto

  @ApiProperty({ type: CompanyAdsStatisticsSourceDto, isArray: true })
  sources: CompanyAdsStatisticsSourceDto[]

  @ApiProperty({ type: CompanyAdsStatisticsItemDto, isArray: true })
  items: CompanyAdsStatisticsItemDto[]
}

