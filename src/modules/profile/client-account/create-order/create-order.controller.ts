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
import { CreateOrderService } from "./create-order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";

@ApiTags("Profile")
@ApiBearerAuth()
@Controller("profile/client/orders")
@UseGuards(JwtAuthGuard)
export class CreateOrderController {
  constructor(private readonly service: CreateOrderService) {}

  @ApiOperation({ summary: "Загрузить файл/фото к заказу" })
  @Post("upload-file")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({ schema: { type: "object", properties: { file: { type: "string", format: "binary" } } } })
  uploadFile(
    @Req() req: { user: { sub: string } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadFile(req.user.sub, file);
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
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.service.updateStatus(req.user.sub, id, dto.status);
  }
}
