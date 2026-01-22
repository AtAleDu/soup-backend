import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsEmail, IsObject, IsOptional, IsString, IsUrl, ValidateIf, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class CompanyPhoneDto {
  @ApiPropertyOptional({ example: '+79998887766' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({ example: 'Иван Иванов' })
  @IsOptional()
  @IsString()
  representativeName?: string
}

class CompanyProfileDto {
  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logo?: string

  @ApiPropertyOptional({ example: 'Тестовая компания' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ example: 'Описание компании' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: ['Челябинская область'] })
  @IsOptional()
  @IsArray()
  regions?: string[]

  @ApiPropertyOptional({ example: 'г. Москва, ул. Пример, 1' })
  @IsOptional()
  @IsString()
  address?: string
}

class CompanyContactsDto {
  @ApiPropertyOptional({ example: ['+79998887766'] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompanyPhoneDto)
  phones?: CompanyPhoneDto[]

  @ApiPropertyOptional({ example: ['contact@company.com', 'sales@company.com'] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  emails?: string[]

  @ApiPropertyOptional({ example: 'contact@company.com' })
  @ValidateIf((_, value) => value !== undefined && value !== null && value !== '')
  @IsEmail()
  email?: string

}

class CompanySocialsDto {
  @ApiPropertyOptional({ example: 'https://example.com' })
  @ValidateIf((_, value) => value !== undefined && value !== null && value !== '')
  @IsUrl()
  website?: string

  @ApiPropertyOptional({ example: 'vk.com/test' })
  @IsOptional()
  @IsString()
  vk?: string

  @ApiPropertyOptional({ example: 'youtube.com/test' })
  @IsOptional()
  @IsString()
  youtube?: string

  @ApiPropertyOptional({ example: '+79998887766' })
  @IsOptional()
  @IsString()
  whatsapp?: string

  @ApiPropertyOptional({ example: '@test' })
  @IsOptional()
  @IsString()
  telegram?: string

  @ApiPropertyOptional({ example: 'https://dzen.ru/test' })
  @IsOptional()
  @IsString()
  yandexDzen?: string
}

export class UpdateCompanyAccountDto {
  @ApiPropertyOptional({ type: CompanyProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyProfileDto)
  profile?: CompanyProfileDto

  @ApiPropertyOptional({ type: CompanyContactsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyContactsDto)
  contacts?: CompanyContactsDto

  @ApiPropertyOptional({ type: CompanySocialsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CompanySocialsDto)
  socials?: CompanySocialsDto

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

  @ApiPropertyOptional({ example: ['Челябинская область'] })
  @IsOptional()
  @IsArray()
  regions?: string[]

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

  @ApiPropertyOptional({ example: 'г. Москва, ул. Пример, 1' })
  @IsOptional()
  @IsString()
  address?: string

  @ApiPropertyOptional({
    example: { telegram: '@test', vk: 'vk.com/test' },
  })
  @IsOptional()
  @IsObject()
  social_links?: Record<string, any>
}
