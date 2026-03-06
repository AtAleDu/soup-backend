import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MaxLength, ValidateIf } from "class-validator";

export class UpdateCompanyModerationDto {
  @ApiProperty({ enum: ["active", "rejected"] })
  @IsIn(["active", "rejected"])
  status: "active" | "rejected";

  @ApiPropertyOptional({ example: "Недостаточно информации о компании" })
  @ValidateIf((_, value) => value !== undefined && value !== null && value !== "")
  @IsString()
  @IsOptional()
  @MaxLength(500)
  rejectionReason?: string;
}
