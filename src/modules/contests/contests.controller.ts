import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { ContestsService } from "./contests.service";
import { CreateContestDto } from "./dto/create-contest.dto";
import { UpdateContestDto } from "./dto/update-contest.dto";

@ApiTags("Contests")
@Controller()
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  // PUBLIC: получить список опубликованных конкурсов
  @ApiOperation({ summary: "Получить список опубликованных конкурсов" })
  @ApiResponse({ status: 200, description: "Список конкурсов" })
  @Get("contests")
  findAll() {
    return this.contestsService.findAllPublished();
  }

  // PUBLIC: получить конкурс по id
  @ApiOperation({ summary: "Получить конкурс по id" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Конкурс найден" })
  @ApiResponse({ status: 404, description: "Конкурс не найден" })
  @Get("contests/:id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.contestsService.findOne(id);
  }

  // ADMIN: создать новый конкурс
  @ApiOperation({ summary: "Создать конкурс (admin)" })
  @ApiResponse({ status: 201, description: "Конкурс создан" })
  @ApiResponse({ status: 400, description: "Ошибка валидации" })
  @Post("admin/contests")
  create(@Body() dto: CreateContestDto) {
    return this.contestsService.create(dto);
  }

  // ADMIN: обновить данные конкурса
  @ApiOperation({ summary: "Обновить конкурс (admin)" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Конкурс обновлён" })
  @ApiResponse({ status: 404, description: "Конкурс не найден" })
  @Put("admin/contests/:id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateContestDto) {
    return this.contestsService.update(id, dto);
  }

  // ADMIN: удалить конкурс
  @ApiOperation({ summary: "Удалить конкурс (admin)" })
  @ApiResponse({ status: 200, description: "Конкурс удалён" })
  @ApiResponse({ status: 404, description: "Конкурс не найден" })
  @Delete("admin/contests/:id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.contestsService.remove(id);
  }
}
