import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { OrderStatus } from "@entities/Order/order.entity";

@ApiTags("Поиск заказов")
@Controller("orders")
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @ApiOperation({
    summary: "Поиск заказов по статусу",
    description:
      "По умолчанию возвращаются активные заказы. Для каталога / откликов компаний.",
  })
  @Get()
  findAll(@Query("status") status?: string) {
    return this.service.findAllByStatus(status ?? OrderStatus.ACTIVE);
  }

  @ApiOperation({
    summary: "Заказ по id (поиск заказов)",
    description: "Для просмотра карточки заказа.",
  })
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const order = await this.service.findOne(id);
    if (!order) throw new NotFoundException("Заказ не найден");
    return order;
  }
}
