import { IsUUID } from "class-validator";

export class ResendDto {
  @IsUUID()
  verificationId: string;
}
