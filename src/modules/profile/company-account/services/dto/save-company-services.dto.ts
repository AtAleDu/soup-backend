import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class SaveCompanyServiceItemDto {
  @ApiProperty({ example: "Проектирование входной группы" })
  @IsString()
  name: string;

  @ApiProperty({ example: "МАФ" })
  @IsString()
  subcategory: string;

  @ApiProperty({
    example: ["https://example.com/service.png"],
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiProperty({
    example: ["https://example.com/service.mp4"],
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videoUrls?: string[];
}

class SaveCompanyServiceCategoryDto {
  @ApiProperty({ example: "Производство" })
  @IsString()
  category: string;

  @ApiProperty({ example: "Описание", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: [{ name: "Проектирование входной группы", subcategory: "МАФ" }],
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SaveCompanyServiceItemDto)
  services: SaveCompanyServiceItemDto[];
}

export class SaveCompanyServicesDto {
  @ApiProperty({ type: SaveCompanyServiceCategoryDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveCompanyServiceCategoryDto)
  categories: SaveCompanyServiceCategoryDto[];
}
