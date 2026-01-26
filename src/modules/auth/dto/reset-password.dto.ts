import { IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
  @ApiProperty({ example: "token", description: "Токен восстановления" })
  @IsString()
  token: string;

  @ApiProperty({ example: "password123", description: "Новый пароль" })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: "password123", description: "Повтор пароля" })
  @IsString()
  @MinLength(6)
  passwordConfirm: string;
}