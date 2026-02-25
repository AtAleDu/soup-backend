import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
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

  // ADMIN: загрузить изображение для новости
  @ApiOperation({ summary: "Загрузить изображение (admin)" })
  @Post("upload-image")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: memoryStorage(),
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({ schema: { type: "object", properties: { image: { type: "string", format: "binary" } } } })
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.service.uploadNewsImage(file);
  }

  // ADMIN: создать новость
  @ApiOperation({ summary: "Создать новость (admin)" })
  @ApiResponse({ status: 201, description: "Новость успешно создана" })
  @Post()
  create(@Body() body: CreateNewsDto) {
    return this.service.create(body);
  }

  // ADMIN: обновить новость
  @ApiOperation({ summary: "Обновить новость (admin)" })
  @ApiParam({ name: "id", example: "uuid" })
  @ApiResponse({ status: 200, description: "Новость обновлена" })
  @Put(":id")
  update(@Param("id") id: string, @Body() body: UpdateNewsDto) {
    return this.service.update(id, body);
  }

  // ADMIN: удалить новость
  @ApiOperation({ summary: "Удалить новость (admin)" })
  @ApiParam({ name: "id", example: "uuid" })
  @ApiResponse({ status: 200, description: "Новость удалена" })
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }

  // ADMIN: закрепить новость
  @ApiOperation({ summary: "Закрепить новость (admin)" })
  @ApiParam({ name: "id", example: "uuid" })
  @ApiResponse({ status: 200, description: "Новость закреплена" })
  @Patch(":id/pin")
  pin(@Param("id") id: string) {
    return this.service.pin(id);
  }

  // ADMIN: открепить новость
  @ApiOperation({ summary: "Открепить новость (admin)" })
  @ApiParam({ name: "id", example: "uuid" })
  @ApiResponse({ status: 200, description: "Новость откреплена" })
  @Patch(":id/unpin")
  unpin(@Param("id") id: string) {
    return this.service.unpin(id);
  }
}