import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ContestsService } from "./contests.service";

@ApiTags("Contests")
@Controller("contests")
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  // PUBLIC: все опубликованные конкурсы
  @ApiOperation({ summary: "Получить все опубликованные конкурсы" })
  @ApiResponse({ status: 200, description: "Список конкурсов" })
  @Get()
  findAll() {
    return this.contestsService.findAllPublished();
  }

  // PUBLIC: текущие конкурсы
  @ApiOperation({ summary: "Получить текущие конкурсы" })
  @ApiResponse({ status: 200, description: "Список текущих конкурсов" })
  @Get("current")
  findCurrent() {
    return this.contestsService.findCurrentPublished();
  }

  // PUBLIC: прошедшие конкурсы
  @ApiOperation({ summary: "Получить прошедшие конкурсы" })
  @ApiResponse({ status: 200, description: "Список прошедших конкурсов" })
  @Get("past")
  findPast() {
    return this.contestsService.findPastPublished();
  }
}
