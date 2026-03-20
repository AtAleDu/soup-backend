import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MaxLength } from 'class-validator';

export class SaveAdvertiserDto {
  @ApiProperty({ example: '1234567890' })
  @IsString()
  inn: string;

  @ApiProperty({ example: '123456789' })
  @IsString()
  kpp: string;

  @ApiProperty({ example: 'ООО Пример' })
  @IsString()
  shortName: string;

  @ApiProperty({ example: 'Общество с ограниченной ответственностью «Пример»' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '+7 (495) 123-45-67' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'example@company.ru' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '123456, г. Москва, ул. Примерная, д. 1' })
  @IsString()
  @IsOptional()
  postalAddress?: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;

  @ApiProperty({ example: '123456, г. Москва, ул. Примерная, д. 1' })
  @IsString()
  @IsOptional()
  legalAddress?: string;
}
