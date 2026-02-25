import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
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
import { ContestsService } from "../contests.service";
import { CreateContestDto } from "../dto/create-contest.dto";
import { UpdateContestDto } from "../dto/update-contest.dto";
import { JwtAuthGuard } from "../../auth/jwt/jwt-auth.guard";

@ApiTags("Contests")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("admin/contests")
export class AdminContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  @ApiOperation({ summary: "Список всех конкурсов (admin)" })
  @ApiResponse({ status: 200, description: "Список конкурсов" })
  @Get()
  findAll() {
    return this.contestsService.findAll();
  }

  @ApiOperation({ summary: "Загрузить изображение конкурса (admin)" })
  @Post("upload-image")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: memoryStorage(),
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { image: { type: "string", format: "binary" } },
    },
  })
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.contestsService.uploadContestImage(file);
  }

  @ApiOperation({ summary: "Получить конкурс по id (admin)" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Конкурс" })
  @ApiResponse({ status: 404, description: "Конкурс не найден" })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.contestsService.findOne(id);
  }

  @ApiOperation({ summary: "Создать конкурс (admin)" })
  @ApiResponse({ status: 201, description: "Конкурс создан" })
  @ApiResponse({ status: 400, description: "Ошибка валидации" })
  @Post()
  create(@Body() dto: CreateContestDto) {
    return this.contestsService.create(dto);
  }

  // ADMIN: обновить данные конкурса
  @ApiOperation({ summary: "Обновить конкурс (admin)" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Конкурс обновлён" })
  @ApiResponse({ status: 404, description: "Конкурс не найден" })
  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateContestDto) {
    return this.contestsService.update(id, dto);
  }

  // ADMIN: удалить конкурс
  @ApiOperation({ summary: "Удалить конкурс (admin)" })
  @ApiResponse({ status: 200, description: "Конкурс удалён" })
  @ApiResponse({ status: 404, description: "Конкурс не найден" })
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.contestsService.remove(id);
  }
}