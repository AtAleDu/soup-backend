import { ApiProperty } from '@nestjs/swagger'

export class ContractorTypeDto {
  @ApiProperty({ example: 'Проектирование' })
  title: string

  @ApiProperty({ example: ['Архитектура', 'Сети'], isArray: true })
  badges: string[]
}
