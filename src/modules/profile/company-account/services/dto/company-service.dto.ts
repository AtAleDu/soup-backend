import { ApiProperty } from "@nestjs/swagger";

export class CompanyServiceCategoryDto {
  @ApiProperty({ example: "Производство" })
  category: string;

  @ApiProperty({ example: "Описание категории", required: false })
  description?: string;

  @ApiProperty({
    example: [{ name: "Проектирование входной группы", subcategory: "МАФ", imageUrls: [] }],
    isArray: true,
  })
  services: { name: string; subcategory: string; imageUrls?: string[] }[];
}

export class CompanyServicesResponseDto {
  @ApiProperty({ type: CompanyServiceCategoryDto, isArray: true })
  categories: CompanyServiceCategoryDto[];
}
