import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
  Body,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { OrderStatus } from "@entities/Order/order.entity";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guard";
import { Roles } from "@modules/auth/guards/roles.decorator";
import { ClientContactsResponseDto } from "./dto/client-contacts-response.dto";
import { RespondOrderDto } from "./dto/respond-order.dto";

@ApiTags("Поиск заказов")
@ApiBearerAuth()
@Controller("orders")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("company")
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
  async findOne(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: { user: { sub: string } },
  ) {
    const order = await this.service.findOne(id, req.user.sub);
    if (!order) throw new NotFoundException("Заказ не найден");
    return order;
  }

  @ApiOperation({
    summary: "Контакты заказчика по id заказа",
    description:
      "Возвращает только контакты, разрешенные privacy-настройками клиента.",
  })
  @Get(":id/client-contacts")
  findClientContacts(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ClientContactsResponseDto> {
    return this.service.findClientContactsByOrderId(id);
  }

  @ApiOperation({
    summary: "Откликнуться на заказ",
    description: "Создает отклик компании на заказ. Повторный отклик запрещен.",
  })
  @Post(":id/respond")
  respond(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: { user: { sub: string } },
    @Body() dto: RespondOrderDto,
  ) {
    return this.service.respond(id, req.user.sub, dto);
  }
}
