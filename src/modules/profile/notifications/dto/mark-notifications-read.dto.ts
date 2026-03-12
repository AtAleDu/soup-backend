import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class MarkNotificationsReadDto {
  @ApiPropertyOptional({
    type: [String],
    description:
      "Идентификаторы уведомлений, которые нужно отметить прочитанными. Если не переданы или массив пустой — будут отмечены все текущие уведомления.",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notificationIds?: string[];
}

