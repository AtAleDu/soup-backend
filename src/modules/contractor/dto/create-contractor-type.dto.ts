import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator'

export class CreateContractorTypeDto {
  @ApiProperty({
    example: 'Проектирование',
    description: 'Название типа подрядчика',
  })
  @IsString()
  title: string

  @ApiProperty({
    example: ['Архитектура', 'Сети'],
    description: 'Список специализаций (бейджей)',
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  badges: string[]
}
