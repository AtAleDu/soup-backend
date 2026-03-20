import { ApiProperty } from '@nestjs/swagger'

export class CompanyAdPositionPreviewBannerDto {
  @ApiProperty({ example: 14 })
  id: number

  @ApiProperty({ example: 'https://cdn.example.com/banner-1.jpg', nullable: true })
  imageUrl: string | null

  @ApiProperty({ example: 'https://example.com/landing', nullable: true })
  link: string | null
}

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

  @ApiProperty({ example: 5000 })
  price: number

  @ApiProperty({ example: 1 })
  sortOrder: number

  @ApiProperty({ example: 3 })
  createdBannersCount: number

  @ApiProperty({ example: 1 })
  maxBanners: number

  @ApiProperty({ example: true })
  canAddToCart: boolean

  @ApiProperty({ type: CompanyAdPositionPreviewBannerDto, isArray: true })
  previewBanners: CompanyAdPositionPreviewBannerDto[]
}

export class CompanyAdPositionsResponseDto {
  @ApiProperty({ type: CompanyAdPositionDto, isArray: true })
  positions: CompanyAdPositionDto[]
}

