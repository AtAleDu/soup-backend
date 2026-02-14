import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { OrderStatus } from "@entities/Order/order.entity";

@ApiTags("Orders")
@Controller("orders")
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @ApiOperation({
    summary: "Список заказов по статусу (всех пользователей)",
    description:
      "По умолчанию возвращаются активные заказы. Для каталога / откликов компаний.",
  })
  @Get()
  findAll(@Query("status") status?: string) {
    return this.service.findAllByStatus(
      status ?? OrderStatus.ACTIVE,
    );
  }
}
