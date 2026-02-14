import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { CreateOrderService } from "./create-order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";

@ApiTags("Profile")
@ApiBearerAuth()
@Controller("profile/client/orders")
@UseGuards(JwtAuthGuard)
export class CreateOrderController {
  constructor(private readonly service: CreateOrderService) {}

  @ApiOperation({ summary: "Создать заказ" })
  @Post()
  create(@Req() req: { user: { sub: string } }, @Body() dto: CreateOrderDto) {
    return this.service.create(req.user.sub, dto);
  }

  @ApiOperation({
    summary: "Список заказов клиента",
    description:
      "Без query или ?status=all — все заказы. ?status=active или ?status=archive — фильтр по статусу.",
  })
  @Get()
  findAll(
    @Req() req: { user: { sub: string } },
    @Query("status") status?: string,
  ) {
    return this.service.findAll(req.user.sub, status);
  }

  @ApiOperation({ summary: "Изменить статус заказа (active / archive)" })
  @Patch(":id")
  updateStatus(
    @Req() req: { user: { sub: string } },
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.service.updateStatus(req.user.sub, id, dto.status);
  }
}
