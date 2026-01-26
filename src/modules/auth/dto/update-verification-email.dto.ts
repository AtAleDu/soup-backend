import { IsEmail, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateVerificationEmailDto {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "ID сессии верификации",
  })
  @IsUUID()
  verificationId: string;

  @ApiProperty({
    example: "newemail@example.com",
    description: "Новый email для верификации",
  })
  @IsEmail()
  newEmail: string;
}