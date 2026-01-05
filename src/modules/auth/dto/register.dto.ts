import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator'
import { UserRole } from '@entities/User/user.entity'

export class RegisterDto {
  @ApiProperty({
    example: 'doer',
    enum: UserRole,
  })
  @IsEnum(UserRole)
  role: UserRole

  @ApiProperty({ example: 'Иван Иванов' })
  @IsString()
  name: string

  @ApiProperty({ example: 'user@mail.com' })
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'StrongPassword123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string

  @ApiProperty({
    example: 'StrongPassword123',
    minLength: 8,
    description: 'Подтверждение пароля',
  })
  @IsString()
  @MinLength(8)
  passwordConfirm: string
}
