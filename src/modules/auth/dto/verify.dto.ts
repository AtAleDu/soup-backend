import { IsUUID, IsString, Length } from "class-validator";

export class VerifyDto {
  @IsUUID()
  verificationId: string;

  @IsString()
  @Length(4, 4)
  code: string;
}
