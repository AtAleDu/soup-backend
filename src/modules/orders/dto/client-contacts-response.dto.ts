import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ClientContactItemDto {
  @ApiProperty({ enum: ["phone", "email", "telegram", "max"] })
  type: "phone" | "email" | "telegram" | "max";

  @ApiProperty({ example: "+7 (900) 000-00-00" })
  value: string;
}

export class ClientContactsResponseDto {
  @ApiPropertyOptional({ example: "Иван Иванов" })
  full_name: string | null;

  @ApiPropertyOptional({ example: "Екатеринбург, Свердловская область" })
  city: string | null;

  @ApiPropertyOptional({ example: "https://example.com/avatar.png" })
  avatar_url: string | null;

  @ApiProperty({ type: [ClientContactItemDto] })
  contacts: ClientContactItemDto[];
}

