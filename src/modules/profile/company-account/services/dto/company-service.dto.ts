import { ApiProperty } from "@nestjs/swagger";

export class CompanyServiceCategoryDto {
  @ApiProperty({ example: "Производство" })
  category: string;

  @ApiProperty({
    example: [{ name: "Проектирование входной группы", subcategory: "МАФ" }],
    isArray: true,
  })
  services: { name: string; subcategory: string }[];
}

export class CompanyServicesResponseDto {
  @ApiProperty({ type: CompanyServiceCategoryDto, isArray: true })
  categories: CompanyServiceCategoryDto[];
}
