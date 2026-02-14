import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class ClientProfileDto {
  @ApiPropertyOptional({ example: "Иван Иванов" })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional({ example: "Москва" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: "https://example.com/avatar.png" })
  @IsOptional()
  @IsString()
  avatar_url?: string | null;
}

class ClientContactDto {
  @ApiPropertyOptional({ example: "email", enum: ["phone", "email", "telegram", "max"] })
  @IsIn(["phone", "email", "telegram", "max"])
  type: "phone" | "email" | "telegram" | "max";

  @ApiPropertyOptional({ example: "user@mail.com" })
  @IsString()
  value: string;
}

class ClientNotificationSettingsDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  sms?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  email?: boolean;
}

class ClientPrivacySettingsDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  phone?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  social_links?: boolean;
}

export class UpdateClientAccountDto {
  @ApiPropertyOptional({ type: ClientProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ClientProfileDto)
  profile?: ClientProfileDto;

  @ApiPropertyOptional({ type: [ClientContactDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClientContactDto)
  contacts?: ClientContactDto[];

  @ApiPropertyOptional({ type: ClientNotificationSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ClientNotificationSettingsDto)
  notification_settings?: ClientNotificationSettingsDto;

  @ApiPropertyOptional({ type: ClientPrivacySettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ClientPrivacySettingsDto)
  privacy_settings?: ClientPrivacySettingsDto;
}
