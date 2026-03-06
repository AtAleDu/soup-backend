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
  @ApiQuery({ name: "badge", required: false, description: "Фильтр по категории (badge)" })
  @ApiQuery({ name: "withAds", required: false, description: "Смешать ленту с рекламой" })
  @ApiQuery({ name: "adsPlacement", required: false, description: "Плейсмент рекламы для mixed-ленты" })
  @ApiResponse({ status: 200, description: "Список новостей" })
  @Get()
  findAll(
    @Query("time") time?: string,
    @Query("badge") badge?: string,
    @Query("withAds") withAds?: string,
    @Query("adsPlacement") adsPlacement?: string,
  ) {
    const withAdsEnabled = withAds === "1" || withAds === "true";
    return this.service.findAll(time, badge, withAdsEnabled, adsPlacement);
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
