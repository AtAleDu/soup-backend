import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { SearchService } from "./search.service";
import { GlobalSearchResponseDto } from "./dto/global-search-response.dto";

@ApiTags("Search")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiOperation({ summary: "Глобальный поиск по названию: компании, новости, блоги, заказы, конкурсы" })
  @ApiQuery({ name: "q", required: true, description: "Поисковый запрос" })
  @ApiResponse({ status: 200, description: "Результаты по типам" })
  @Get()
  search(@Query("q") q?: string): Promise<GlobalSearchResponseDto> {
    return this.searchService.search(q ?? "");
  }
}
