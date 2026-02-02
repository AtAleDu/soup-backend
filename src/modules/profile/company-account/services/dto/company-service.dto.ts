import { ApiProperty } from "@nestjs/swagger";

export class CompanyServiceCategoryDto {
  @ApiProperty({ example: "Производство" })
  category: string;

  @ApiProperty({
    example: [{ name: "Проектирование входной группы", subcategory: "МАФ", imageUrl: null }],
    isArray: true,
  })
  services: { name: string; subcategory: string; imageUrl?: string | null }[];
}

export class CompanyServicesResponseDto {
  @ApiProperty({ type: CompanyServiceCategoryDto, isArray: true })
  categories: CompanyServiceCategoryDto[];
}
