import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsObject, IsOptional, Min } from 'class-validator'

export class UpdateAdsCartItemDto {
  @ApiPropertyOptional({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number

  @ApiPropertyOptional({ example: 14 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  periodDays?: number

  @ApiPropertyOptional({ example: { placement: 'catalog' } })
  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>
}
