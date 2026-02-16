import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsArray, IsOptional, IsString, ValidateNested } from 'class-validator'

export class CreateContractorSubcategoryDto {
  @ApiProperty({ example: 'Архитектура' })
  @IsString()
  title: string

  @ApiProperty({ example: null, nullable: true, required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string

  @ApiProperty({ example: null, nullable: true, required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string
}

export class CreateContractorTypeDto {
  @ApiProperty({
    example: 'Проектирование',
    description: 'Название категории подрядчиков',
  })
  @IsString()
  title: string

  @ApiProperty({
    example: null,
    nullable: true,
    required: false,
    description: 'Логотип категории (URL)',
  })
  @IsOptional()
  @IsString()
  logoUrl?: string

  @ApiProperty({
    type: CreateContractorSubcategoryDto,
    isArray: true,
    description: 'Сабкатегории категории',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateContractorSubcategoryDto)
  subcategories: CreateContractorSubcategoryDto[]
}
