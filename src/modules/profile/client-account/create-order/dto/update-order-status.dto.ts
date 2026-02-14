import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";
import { OrderStatus } from "@entities/Order/order.entity";

export class UpdateOrderStatusDto {
  @ApiProperty({ example: "archive", enum: Object.values(OrderStatus) })
  @IsIn(Object.values(OrderStatus))
  status: string;
}
