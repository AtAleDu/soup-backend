import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({
    example: "user@mail.com",
    description: "Email пользователя",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "StrongPassword123",
    description: "Пароль пользователя",
  })
  @IsString()
  password: string;
}
