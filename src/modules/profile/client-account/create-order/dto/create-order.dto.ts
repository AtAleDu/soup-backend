import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsISO8601,
  IsBoolean,
  IsArray,
  IsUrl,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateOrderDto {
  @ApiProperty({ example: "Ремонт кухни" })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: "Нужно заменить столешницу и фартук" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: "Москва, ул. Ленина 1" })
  @IsString()
  location: string;

  @ApiProperty({ example: "Ремонт" })
  @IsString()
  category: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budget: number;

  @ApiPropertyOptional({ example: "2025-03-01T00:00:00.000Z" })
  @IsOptional()
  @IsISO8601()
  deadline?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hidePhone?: boolean;

  @ApiPropertyOptional({
    example: ["https://example.com/file1.jpg"],
    type: [String],
    description: "Ссылки на загруженные файлы/фото",
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  fileUrls?: string[];
}
