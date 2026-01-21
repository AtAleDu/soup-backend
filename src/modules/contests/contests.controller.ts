import {
  Controller,
  Get,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ContestsService } from "./contests.service";

@ApiTags("Contests")
@Controller()
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  // PUBLIC: получить текущие опубликованные конкурсы
  @ApiOperation({ summary: "Получить текущие конкурсы" })
  @ApiResponse({ status: 200, description: "Список текущих конкурсов" })
  @Get("contests/current")
  findCurrent() {
    return this.contestsService.findCurrentPublished();
  }

  // PUBLIC: получить прошедшие конкурсы
  @ApiOperation({ summary: "Получить прошедшие конкурсы" })
  @ApiResponse({ status: 200, description: "Список прошедших конкурсов" })
  @Get("contests/past")
  findPast() {
    return this.contestsService.findPastPublished();
  }
}