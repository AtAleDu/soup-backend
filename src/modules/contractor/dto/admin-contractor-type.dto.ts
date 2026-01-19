import { ApiProperty } from '@nestjs/swagger'

export class AdminContractorTypeDto {
  @ApiProperty({ example: 'uuid' })
  id: string

  @ApiProperty({ example: 'Проектирование' })
  title: string

  @ApiProperty({
    example: ['Архитектура', 'Сети'],
    isArray: true,
  })
  badges: string[]
}
