import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Patch,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { BlogStatus } from "@entities/Blog/blog.entity";
import { BlogsService } from "../blogs.service";
import { UpdateBlogDto } from "../dto/update-blog.dto";

@ApiTags("Blogs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("admin/blogs")
export class AdminBlogsController {
  constructor(private readonly service: BlogsService) {}

  @ApiOperation({ summary: "Список всех блогов (admin)" })
  @ApiResponse({ status: 200, description: "Список блогов" })
  @Get()
  findAll(@Query("status") status?: "draft" | "published" | "moderation") {
    const statusMap: Record<string, BlogStatus> = {
      draft: BlogStatus.DRAFT,
      moderation: BlogStatus.MODERATION,
      published: BlogStatus.PUBLISHED,
    };
    return this.service.findAllForAdmin(status ? statusMap[status] : undefined);
  }

  @ApiOperation({ summary: "Загрузить изображение блога (admin)" })
  @Post("upload-image")
  @UseInterceptors(
    FileInterceptor("image", { storage: memoryStorage() }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { image: { type: "string", format: "binary" } },
    },
  })
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.service.uploadBlogImageForAdmin(file);
  }

  @ApiOperation({ summary: "Получить блог по id (admin)" })
  @ApiParam({ name: "id", example: "uuid" })
  @ApiResponse({ status: 200, description: "Блог" })
  @ApiResponse({ status: 404, description: "Блог не найден" })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOneForAdmin(id);
  }

  @ApiOperation({ summary: "Обновить блог (admin)" })
  @ApiParam({ name: "id", example: "uuid" })
  @ApiResponse({ status: 200, description: "Блог обновлён" })
  @ApiResponse({ status: 404, description: "Блог не найден" })
  @Put(":id")
  update(@Param("id") id: string, @Body() dto: UpdateBlogDto) {
    return this.service.updateForAdmin(id, dto);
  }

  @ApiOperation({ summary: "Удалить блог (admin)" })
  @ApiParam({ name: "id", example: "uuid" })
  @ApiResponse({ status: 200, description: "Блог удалён" })
  @ApiResponse({ status: 404, description: "Блог не найден" })
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.removeForAdmin(id);
  }

  @ApiOperation({ summary: "Закрепить блог на странице блогов (admin)" })
  @ApiParam({ name: "id", example: "uuid" })
  @Patch(":id/pin")
  pin(@Param("id") id: string) {
    return this.service.pin(id);
  }

  @ApiOperation({ summary: "Открепить блог (admin)" })
  @ApiParam({ name: "id", example: "uuid" })
  @Patch(":id/unpin")
  unpin(@Param("id") id: string) {
    return this.service.unpin(id);
  }
}