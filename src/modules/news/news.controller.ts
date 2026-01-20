import { Controller, Get, Param } from "@nestjs/common";
import {ApiTags,ApiOperation,ApiResponse,ApiParam,} from "@nestjs/swagger";
import { NewsService } from "./news.service";

@ApiTags("News")
@Controller("news")
export class NewsController {
  constructor(private readonly service: NewsService) {}

  // PUBLIC: получить список новостей
  @ApiOperation({ summary: "Получить список новостей" })
  @ApiResponse({ status: 200, description: "Список новостей" })
  @Get()
  findAll() {
    return this.service.findAll();
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
