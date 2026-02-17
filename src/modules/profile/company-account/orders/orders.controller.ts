import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { CompanyOrdersService } from "./orders.service";

@ApiTags("Profile")
@ApiBearerAuth()
@Controller("profile/company/orders")
@UseGuards(JwtAuthGuard)
export class CompanyOrdersController {
  constructor(private readonly service: CompanyOrdersService) {}

  @ApiOperation({
    summary: "Список заказов, на которые откликнулась компания",
    description:
      "status=responded (по умолчанию) возвращает откликнутые заказы. status=archive пока возвращает пустой список.",
  })
  @Get()
  findAll(
    @Req() req: { user: { sub: string } },
    @Query("status") status?: string,
  ) {
    return this.service.findOrdersByStatus(req.user.sub, status);
  }

  @ApiOperation({
    summary: "Мой отклик компании по заказу",
  })
  @Get(":id/response")
  findMyResponse(
    @Req() req: { user: { sub: string } },
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.service.findMyResponseByOrderId(req.user.sub, id);
  }

  @ApiOperation({
    summary: "Отменить отклик компании по заказу",
  })
  @Delete(":id/response")
  cancelMyResponse(
    @Req() req: { user: { sub: string } },
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.service.cancelMyResponse(req.user.sub, id);
  }
}
