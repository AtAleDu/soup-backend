import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsArray, IsEnum } from "class-validator";
import { BlogStatus } from "@entities/Blog/blog.entity";

export class UpdateBlogDto {
  @ApiPropertyOptional({ enum: BlogStatus, example: BlogStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({ example: "Причина отказа от модерации" })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

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
