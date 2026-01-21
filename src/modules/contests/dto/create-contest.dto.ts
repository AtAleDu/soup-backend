import { IsDateString, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateContestDto {
  @ApiProperty({
    example: "Тестовый конкурс",
    description: "Название конкурса",
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: "https://example.com",
    description: "Ссылка на конкурс",
  })
  @IsString()
  contestLink: string;

  @ApiProperty({
    example: "2026-01-10",
    description: "Дата начала конкурса (ISO)",
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: "2026-01-20",
    description: "Дата окончания конкурса (ISO)",
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    example: "https://example.com/image.jpg",
    description: "URL изображения конкурса",
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}