import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength, IsIn } from 'class-validator'

export class RegisterDto {
  @ApiProperty({
    example: 'customer',
    description: 'Роль пользователя',
    enum: ['customer', 'executor'],
  })
  @IsIn(['customer', 'executor'])
  role: 'customer' | 'executor'

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
    minLength: 5,
    description: 'Пароль (минимум 5 символов)',
  })
  @IsString()
  @MinLength(8)
  password: string
}
