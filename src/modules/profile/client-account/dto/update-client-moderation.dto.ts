import {
  ApiProperty,
  ApiPropertyOptional,
} from "@nestjs/swagger";
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from "class-validator";

export class UpdateClientModerationDto {
  @ApiProperty({ enum: ["active", "rejected"] })
  @IsIn(["active", "rejected"])
  status: "active" | "rejected";

  @ApiPropertyOptional({ example: "Недостаточно данных для подтверждения" })
  @ValidateIf(
    (_, value) => value !== undefined && value !== null && value !== "",
  )
  @IsString()
  @IsOptional()
  @MaxLength(500)
  rejectionReason?: string;
}
