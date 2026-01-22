import { IsOptional, IsString, IsUrl, IsObject } from 'class-validator'

export class UpdateCompanyAccountDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  region?: string

  @IsOptional()
  @IsString()
  activity_type?: string

  @IsOptional()
  @IsUrl()
  website?: string

  @IsOptional()
  @IsUrl()
  logo_url?: string

  @IsOptional()
  @IsObject()
  social_links?: Record<string, any>
}
