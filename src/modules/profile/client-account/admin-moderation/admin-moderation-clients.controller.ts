import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guard";
import { Roles } from "@modules/auth/guards/roles.decorator";
import { UpdateClientModerationDto } from "../dto/update-client-moderation.dto";
import { AdminModerationClientsService } from "./admin-moderation-clients.service";

@ApiTags("Admin moderation clients")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin/moderation/clients")
export class AdminModerationClientsController {
  constructor(
    private readonly service: AdminModerationClientsService,
  ) {}

  @ApiOperation({ summary: "Список клиентов в статусе moderation" })
  @ApiResponse({ status: 200, description: "Список клиентов" })
  @Get()
  getModerationClients() {
    return this.service.getModerationClients();
  }

  @ApiOperation({ summary: "Данные клиента в статусе moderation" })
  @ApiResponse({ status: 200, description: "Данные клиента" })
  @ApiResponse({ status: 404, description: "Клиент не найден" })
  @Get(":id")
  getModerationClient(@Param("id", ParseIntPipe) id: number) {
    return this.service.getModerationClient(id);
  }

  @ApiOperation({ summary: "Одобрить или отклонить клиента на модерации" })
  @ApiResponse({ status: 200, description: "Статус клиента обновлён" })
  @Patch(":id")
  moderateClient(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateClientModerationDto,
  ) {
    return this.service.moderateClient(id, dto);
  }
}
