import { ApiProperty } from '@nestjs/swagger'

export class CatalogFilterResponseDto {
  @ApiProperty({ example: 'Проектирование' })
  category: string

  @ApiProperty({
    example: ['архитектура', 'благоустройство'],
    type: [String],
  })
  items: string[]
}
