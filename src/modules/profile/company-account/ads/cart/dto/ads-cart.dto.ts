import { ApiProperty } from '@nestjs/swagger'

export class AdsCartItemDto {
  @ApiProperty({ example: 11 })
  id: number

  @ApiProperty({ example: 'position' })
  itemType: string

  @ApiProperty({ example: 1, nullable: true })
  positionId: number | null

  @ApiProperty({ example: 'banner', nullable: true })
  positionCode: string | null

  @ApiProperty({ example: 'Баннеры', nullable: true })
  positionTitle: string | null

  @ApiProperty({ example: 2, nullable: true })
  tariffId: number | null

  @ApiProperty({ example: 'Business', nullable: true })
  tariffName: string | null

  @ApiProperty({ example: 1 })
  quantity: number

  @ApiProperty({ example: 30 })
  periodDays: number

  @ApiProperty({ example: 30000 })
  unitPrice: number

  @ApiProperty({ example: 30000 })
  lineTotal: number
}

export class AdsCartDto {
  @ApiProperty({ example: 5 })
  id: number

  @ApiProperty({ example: 'active' })
  status: string

  @ApiProperty({ example: 'RUB' })
  currency: string

  @ApiProperty({ example: 30000 })
  subtotal: number

  @ApiProperty({ example: 30000 })
  total: number

  @ApiProperty({ example: 3 })
  version: number

  @ApiProperty({ type: AdsCartItemDto, isArray: true })
  items: AdsCartItemDto[]
}

export class AdsCartResponseDto {
  @ApiProperty({ type: AdsCartDto })
  cart: AdsCartDto
}
