import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class RespondOrderDto {
  @ApiPropertyOptional({
    example: "Готовы выполнить заказ за 5 дней. Есть релевантный опыт.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @ApiPropertyOptional({ example: 120000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priceFrom?: number;

  @ApiPropertyOptional({ example: 180000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priceTo?: number;

  @ApiPropertyOptional({ example: "2026-03-20T00:00:00.000Z" })
  @IsOptional()
  @IsString()
  deadlineOffer?: string;
}
