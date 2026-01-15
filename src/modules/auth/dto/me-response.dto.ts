import { ApiProperty } from "@nestjs/swagger";

export class MeResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "user@mail.com" })
  email: string;

  @ApiProperty({ example: "Иван Иванов" })
  name: string;

  @ApiProperty({
    example: "customer",
    enum: ["customer", "executor"],
  })
  role: "customer" | "executor";
}
