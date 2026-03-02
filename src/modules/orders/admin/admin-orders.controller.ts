import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Body,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { OrdersService } from "../orders.service";
import { UpdateOrderStatusDto } from "../dto/update-order-status.dto";
import { OrderStatus } from "@entities/Order/order.entity";

@ApiTags("Orders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("admin/orders")
export class AdminOrdersController {
  constructor(private readonly service: OrdersService) {}

  @ApiOperation({ summary: "Список заказов (admin)" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["active", "completed", "moderation"],
    description: "Фильтр по статусу",
  })
  @ApiResponse({ status: 200, description: "Список заказов" })
  @Get()
  findAll(@Query("status") status?: "active" | "completed" | "moderation") {
    const filterStatus = status ?? OrderStatus.MODERATION;
    return this.service.findAllForAdmin(filterStatus);
  }

  @ApiOperation({ summary: "Заказ по id (admin)" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiResponse({ status: 200, description: "Заказ" })
  @ApiResponse({ status: 404, description: "Заказ не найден" })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOneForAdmin(id);
  }

  @ApiOperation({ summary: "Обновить статус заказа (admin)" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiResponse({ status: 200, description: "Статус обновлён" })
  @ApiResponse({ status: 404, description: "Заказ не найден" })
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.service.updateStatusForAdmin(id, {
      status: dto.status,
      rejectionReason: dto.rejectionReason,
    });
  }

  @ApiOperation({ summary: "Удалить заказ (admin)" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiResponse({ status: 200, description: "Заказ удалён" })
  @ApiResponse({ status: 404, description: "Заказ не найден" })
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.service.removeForAdmin(id);
  }
}
