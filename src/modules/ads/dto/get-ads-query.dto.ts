import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class GetAdsQueryDto {
  @ApiPropertyOptional({ example: 'news_inline' })
  @IsOptional()
  @IsString()
  placement?: string

  @ApiPropertyOptional({ example: 'banner' })
  @IsOptional()
  @IsString()
  adKind?: string

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number
}
