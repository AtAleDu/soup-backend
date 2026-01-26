import { IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ForgotPasswordDto {
  @ApiProperty({ example: "user@mail.com", description: "Email пользователя" })
  @IsEmail()
  email: string;
}