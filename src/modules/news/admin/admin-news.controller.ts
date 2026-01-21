import {Controller,Post,Put,Delete,Body,Param,UseGuards,Patch,} from "@nestjs/common";
import {ApiTags,ApiOperation,ApiResponse,ApiParam,ApiBearerAuth,} from "@nestjs/swagger";
import { NewsService } from "../news.service";
import { CreateNewsDto } from "../dto/create-news.dto";
import { UpdateNewsDto } from "../dto/update-news.dto";
import { JwtAuthGuard } from "../../auth/jwt/jwt-auth.guard";

@ApiTags("News")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("admin/news")
export class AdminNewsController {
  constructor(private readonly service: NewsService) {}

  // ADMIN: создать новость
  @ApiOperation({ summary: "Создать новость" })
  @ApiResponse({ status: 201, description: "Новость успешно создана" })
  @Post()
  create(@Body() body: CreateNewsDto) {
    return this.service.create(body);
  }

  // ADMIN: обновить новость
  @ApiOperation({ summary: "Обновить новость" })
  @ApiParam({ name: "id", example: "uuid" })
  @ApiResponse({ status: 200, description: "Новость обновлена" })
  @Put(":id")
  update(@Param("id") id: string, @Body() body: UpdateNewsDto) {
    return this.service.update(id, body);
  }

  // ADMIN: удалить новость
  @ApiOperation({ summary: "Удалить новость" })
  @ApiParam({ name: "id", example: "uuid" })
  @ApiResponse({ status: 200, description: "Новость удалена" })
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }

  // ADMIN: закрепить новость
  @ApiOperation({ summary: "Закрепить новость" })
  @ApiParam({ name: "id", example: "uuid" })
  @ApiResponse({ status: 200, description: "Новость закреплена" })
  @Patch(":id/pin")
  pin(@Param("id") id: string) {
    return this.service.pin(id);
  }

  // ADMIN: открепить новость
  @ApiOperation({ summary: "Открепить новость" })
  @ApiParam({ name: "id", example: "uuid" })
  @ApiResponse({ status: 200, description: "Новость откреплена" })
  @Patch(":id/unpin")
  unpin(@Param("id") id: string) {
    return this.service.unpin(id);
  }
}