import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator'
import { AdKind, type AdKindValue } from '@entities/Ad/ad-kind.enum'

export class CreateAdminAdDto {
  @ApiProperty({ example: 'banner' })
  @IsString()
  @IsIn(Object.values(AdKind))
  adKind: AdKindValue

  @ApiProperty({ example: 'main-page-banner' })
  @IsString()
  placement: string

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  sortOrder: number

  @ApiProperty({ example: 'Комплексное благоустройство территорий' })
  @IsString()
  @MaxLength(255)
  title: string

  @ApiPropertyOptional({ example: 'Описание баннера', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null

  @ApiProperty({ example: 'https://cdn.example.com/banner.webp' })
  @IsString()
  imageUrl: string

  @ApiProperty({ example: 'https://example.com/landing' })
  @IsString()
  targetUrl: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({ example: '2026-03-14', nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string | null

  @ApiPropertyOptional({ example: '2026-04-14', nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string | null
}
