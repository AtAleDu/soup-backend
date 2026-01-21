import { IsDateString, IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateContestDto {
  @ApiPropertyOptional({
    example: "Обновлённый конкурс",
    description: "Название конкурса",
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: "https://example.com",
    description: "Ссылка на конкурс",
  })
  @IsOptional()
  @IsString()
  contestLink?: string;

  @ApiPropertyOptional({
    example: "2026-01-12",
    description: "Дата начала конкурса (ISO)",
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: "2026-01-25",
    description: "Дата окончания конкурса (ISO)",
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: "https://example.com/image.jpg",
    description: "URL изображения конкурса",
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

}