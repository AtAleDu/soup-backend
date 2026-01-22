import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsUrl, IsObject } from 'class-validator'

export class UpdateCompanyAccountDto {
  @ApiPropertyOptional({ example: 'Тестовая компания' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ example: 'Описание компании' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: 'Челябинская область' })
  @IsOptional()
  @IsString()
  region?: string

  @ApiPropertyOptional({ example: 'Строительство' })
  @IsOptional()
  @IsString()
  activity_type?: string

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsUrl()
  website?: string

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logo_url?: string

  @ApiPropertyOptional({
    example: { telegram: '@test', vk: 'vk.com/test' },
  })
  @IsOptional()
  @IsObject()
  social_links?: Record<string, any>
}
