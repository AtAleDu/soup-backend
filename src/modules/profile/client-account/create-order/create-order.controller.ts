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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { Public } from "@modules/auth/public.decorator";
import { CreateOrderService } from "./create-order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { ClientUpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { SuggestOrderService } from "../suggest-order";
import { SuggestOrderDto } from "../suggest-order/dto/suggest-order.dto";

@ApiTags("Profile")
@ApiBearerAuth()
@Controller("profile/client/orders")
@UseGuards(JwtAuthGuard)
export class CreateOrderController {
  constructor(
    private readonly service: CreateOrderService,
    private readonly suggestOrderService: SuggestOrderService,
  ) {}

  @ApiOperation({ summary: "Загрузить файл/фото к заказу (доступно без авторизации)" })
  @Public()
  @Post("upload-file")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({ schema: { type: "object", properties: { file: { type: "string", format: "binary" } } } })
  uploadFile(
    @Req() req: { user?: { sub: string } },
    @UploadedFile() file,
  ) {
    return this.service.uploadFile(req.user?.sub, file);
  }

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

  @ApiOperation({ summary: "Получить заказ по id" })
  @Get(":id")
  findOne(
    @Req() req: { user: { sub: string } },
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.service.findOne(req.user.sub, id);
  }

  @ApiOperation({ summary: "Изменить статус заказа (active / archive)" })
  @Patch(":id")
  updateStatus(
    @Req() req: { user: { sub: string } },
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ClientUpdateOrderStatusDto,
  ) {
    return this.service.updateStatus(req.user.sub, id, dto.status);
  }

  @ApiOperation({
    summary: "Предложить заказ компании",
    description: "Создаёт запись о предложении заказа компании. Компания получит уведомление о предложенном заказе.",
  })
  @Post(":id/suggest")
  suggest(
    @Req() req: { user: { sub: string } },
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: SuggestOrderDto,
  ) {
    return this.suggestOrderService.suggest(id, req.user.sub, dto);
  }
}
