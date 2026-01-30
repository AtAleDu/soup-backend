import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsArray } from "class-validator";

export class UpdateBlogDto {
  @ApiPropertyOptional({ example: "https://cdn.site/blog/cover.jpg" })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: "Заголовок блога" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: "Описание блога" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: "array", items: { type: "object" } })
  @IsOptional()
  @IsArray()
  contentBlocks?: unknown[];
}