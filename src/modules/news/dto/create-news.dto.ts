import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
} from "class-validator";

export class CreateNewsDto {
  @ApiProperty({
    example: "https://cdn.site/news/cover.jpg",
    description: "Ссылка на изображение новости",
  })
  @IsString()
  image: string;

  @ApiProperty({
    example: "Обложка новости",
    description: "alt-текст изображения",
  })
  @IsString()
  imageAlt: string;

  @ApiProperty({
    example: "Политика",
    description: "Категория новости",
  })
  @IsString()
  category: string;

  @ApiProperty({
    example: "Заголовок новости",
    description: "Основной заголовок",
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: "Редактор Иван Иванов",
    description: "Автор новости",
  })
  @IsString()
  author: string;

  @ApiPropertyOptional({
    example: "Краткое описание новости",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: ["Первый абзац", "Второй абзац"],
    description: "Контент новости по блокам",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  content?: string[];

  @ApiPropertyOptional({
    example: false,
    description: "Является ли новость рекламной",
  })
  @IsOptional()
  @IsBoolean()
  isAds?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: "Отметка важной новости",
  })
  @IsOptional()
  @IsBoolean()
  isImportantNew?: boolean;
}
