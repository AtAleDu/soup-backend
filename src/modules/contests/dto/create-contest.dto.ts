import { IsString, IsOptional, IsDateString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateContestDto {
  @ApiProperty({
    example: 'Тестовый конкурс',
    description: 'Название конкурса',
  })
  @IsString()
  title: string

  @ApiPropertyOptional({
    example: 'Описание тестового конкурса',
    description: 'Краткое описание конкурса',
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({
    example: '2026-01-10',
    description: 'Дата начала конкурса (ISO)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({
    example: '2026-01-20',
    description: 'Дата окончания конкурса (ISO)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
    description: 'URL изображения конкурса',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string
}
