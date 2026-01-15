import { IsString, IsOptional, IsDateString, IsBoolean } from "class-validator";
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
    example: "Новое описание конкурса",
    description: "Описание конкурса",
  })
  @IsOptional()
  @IsString()
  description?: string;

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
    example: "Победитель — ООО Ромашка",
    description: "Результат конкурса",
  })
  @IsOptional()
  @IsString()
  result?: string;

  @ApiPropertyOptional({
    example: false,
    description: "Флаг публикации конкурса",
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
