import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from "@nestjs/swagger";
import { ContestsService } from "./contests.service";

@ApiTags("Contests")
@Controller()
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  // PUBLIC: получить текущие опубликованные конкурсы
  @ApiOperation({ summary: "Получить текущие конкурсы" })
  @ApiQuery({ name: "time", required: false, enum: ["week", "month", "all"] })
  @ApiQuery({ name: "free", required: false, type: Boolean, description: "Только бесплатные" })
  @ApiResponse({ status: 200, description: "Список текущих конкурсов" })
  @Get("contests/current")
  findCurrent(
    @Query("time") time?: string,
    @Query("free") free?: string,
  ) {
    return this.contestsService.findCurrentPublished(time, free);
  }

  // PUBLIC: получить прошедшие конкурсы
  @ApiOperation({ summary: "Получить прошедшие конкурсы" })
  @ApiQuery({ name: "time", required: false, enum: ["week", "month", "all"] })
  @ApiResponse({ status: 200, description: "Список прошедших конкурсов" })
  @Get("contests/past")
  findPast(@Query("time") time?: string) {
    return this.contestsService.findPastPublished(time);
  }

  // PUBLIC: получить конкурс по id
  @ApiOperation({ summary: "Получить конкурс по id" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Конкурс" })
  @ApiResponse({ status: 404, description: "Конкурс не найден" })
  @Get("contests/:id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.contestsService.findOne(id);
  }
}