import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from "@nestjs/swagger";
import { BlogsService } from "./blogs.service";

@ApiTags("Blogs")
@Controller("blogs")
export class BlogsController {
  constructor(private readonly service: BlogsService) {}

  @ApiOperation({ summary: "Список всех опубликованных блогов (все пользователи)" })
  @ApiResponse({ status: 200, description: "Список блогов" })
  @Get()
  findAll(@Query("companyId") companyId?: string) {
    return this.service.findAll(companyId);
  }

  @ApiOperation({ summary: "Один опубликованный блог по ID" })
  @ApiParam({ name: "id", example: "uuid" })
  @ApiResponse({ status: 200, description: "Блог найден" })
  @ApiResponse({ status: 404, description: "Блог не найден" })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }
}
