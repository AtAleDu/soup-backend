import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  Min,
  ValidateIf,
} from 'class-validator'

export class AddAdsCartItemDto {
  @ApiPropertyOptional({ example: 'position', enum: ['position', 'tariff'] })
  @IsOptional()
  @IsIn(['position', 'tariff'])
  itemType?: 'position' | 'tariff'

  @ApiPropertyOptional({ example: 1 })
  @ValidateIf((dto: AddAdsCartItemDto) => (dto.itemType ?? 'position') === 'position')
  @Type(() => Number)
  @IsInt()
  @Min(1)
  positionId?: number

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number

  @ApiPropertyOptional({ example: 30 })
  @ValidateIf((dto: AddAdsCartItemDto) => (dto.itemType ?? 'position') === 'position')
  @Type(() => Number)
  @IsInt()
  @Min(1)
  periodDays?: number

  @ApiPropertyOptional({ example: 2 })
  @ValidateIf((dto: AddAdsCartItemDto) => dto.itemType === 'tariff')
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tariffId?: number

  @ApiPropertyOptional({ example: { placement: 'home-top' } })
  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>
}
