import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateCompanyServicesModerationDto {
  @ApiProperty({ enum: ["active", "rejected"] })
  @IsIn(["active", "rejected"])
  status: "active" | "rejected";

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
