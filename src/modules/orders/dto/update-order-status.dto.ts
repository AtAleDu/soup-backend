import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";
import { OrderStatus } from "@entities/Order/order.entity";

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: [OrderStatus.ACTIVE, OrderStatus.COMPLETED, OrderStatus.MODERATION],
    example: OrderStatus.ACTIVE,
  })
  @IsIn([OrderStatus.ACTIVE, OrderStatus.COMPLETED, OrderStatus.MODERATION])
  status: "active" | "completed" | "moderation";

  @ApiPropertyOptional({ example: "Причина отказа" })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
