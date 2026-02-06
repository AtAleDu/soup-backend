import { Controller, Get, Param, Query } from "@nestjs/common";
import {ApiTags,ApiOperation,ApiResponse,ApiParam,ApiQuery,} from "@nestjs/swagger";
import { NewsService } from "./news.service";

@ApiTags("News")
@Controller("news")
export class NewsController {
  constructor(private readonly service: NewsService) {}

  // PUBLIC: получить список новостей
  @ApiOperation({ summary: "Получить список новостей" })
  @ApiQuery({ name: "time", required: false, enum: ["week", "month", "all"] })
  @ApiResponse({ status: 200, description: "Список новостей" })
  @Get()
  findAll(@Query("time") time?: string) {
    return this.service.findAll(time);
  }

  // PUBLIC: получить новость по ID
  @ApiOperation({ summary: "Получить новость по ID" })
  @ApiParam({ name: "id", example: "uuid" })
  @ApiResponse({ status: 200, description: "Новость найдена" })
  @ApiResponse({ status: 404, description: "Новость не найдена" })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }
}
