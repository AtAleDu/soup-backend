import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { ContestsService } from "./contests.service";

@ApiTags("Contests")
@Controller()
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  // PUBLIC: получить текущие опубликованные конкурсы
  @ApiOperation({ summary: "Получить текущие конкурсы" })
  @ApiQuery({ name: "time", required: false, enum: ["week", "month", "all"] })
  @ApiResponse({ status: 200, description: "Список текущих конкурсов" })
  @Get("contests/current")
  findCurrent(@Query("time") time?: string) {
    return this.contestsService.findCurrentPublished(time);
  }

  // PUBLIC: получить прошедшие конкурсы
  @ApiOperation({ summary: "Получить прошедшие конкурсы" })
  @ApiQuery({ name: "time", required: false, enum: ["week", "month", "all"] })
  @ApiResponse({ status: 200, description: "Список прошедших конкурсов" })
  @Get("contests/past")
  findPast(@Query("time") time?: string) {
    return this.contestsService.findPastPublished(time);
  }
}