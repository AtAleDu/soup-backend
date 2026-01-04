import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator'

export enum UserRole {
  USER = 'user',
  COMPANY = 'company',
}

export class RegisterDto {
  @ApiProperty({
    example: 'user',
    description: 'Роль пользователя',
    enum: UserRole,
  })
  @IsEnum(UserRole)
  role: UserRole

  @ApiProperty({
    example: 'Иван Иванов',
    description: 'Имя пользователя',
  })
  @IsString()
  name: string

  @ApiProperty({
    example: 'user@mail.com',
    description: 'Email для входа',
  })
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'StrongPassword123',
    minLength: 8,
    description: 'Пароль (минимум 8 символов)',
  })
  @IsString()
  @MinLength(8)
  password: string
}
