import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class RejectAdDto {
  @ApiPropertyOptional({ example: 'Креатив нарушает требования площадки' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string
}
