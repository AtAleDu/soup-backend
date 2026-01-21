import { ApiProperty } from "@nestjs/swagger";

export class RegionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "Москва" })
  label: string;
}
