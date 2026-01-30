import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsArray, IsNotEmpty, IsBoolean } from "class-validator";

export class CreateBlogDto {
  @ApiProperty({ example: "https://cdn.site/blog/cover.jpg", description: "Ссылка на изображение" })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty({ example: "Заголовок блога", description: "Заголовок" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "Описание блога", description: "Описание" })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: "Опциональные блоки контента (subtitle2, subtitle3, image, divider, bulletList, numberedList)",
    type: "array",
    items: { type: "object" },
  })
  @IsOptional()
  @IsArray()
  contentBlocks?: unknown[];

  @ApiPropertyOptional({
    example: false,
    description: "true — сразу опубликовать, false или не передавать — сохранить черновиком",
  })
  @IsOptional()
  @IsBoolean()
  publish?: boolean;
}