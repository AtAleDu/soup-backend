import { Controller, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from "@nestjs/swagger";
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

  // ADMIN: создать новый конкурс
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