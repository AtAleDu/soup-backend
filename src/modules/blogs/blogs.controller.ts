import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { BlogsService } from "./blogs.service";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/jwt/optional-jwt-auth.guard";

@ApiTags("Blogs")
@Controller("blogs")
export class BlogsController {
  constructor(private readonly service: BlogsService) {}

  @ApiOperation({
    summary: "Список всех опубликованных блогов (все пользователи)",
  })
  @ApiResponse({ status: 200, description: "Список блогов" })
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  findAll(@Query("companyId") companyId?: string, @Req() req?: any) {
    const userId = req?.user?.sub;
    return this.service.findAll(companyId, userId);
  }

  @ApiOperation({ summary: "Получить самые залайканные блоги" })
  @ApiResponse({ status: 200, description: "Список топ блогов по лайкам" })
  @UseGuards(OptionalJwtAuthGuard)
  @Get("top/liked")
  findTopLiked(@Query("limit") limit?: string, @Req() req?: any) {
    const userId = req?.user?.sub;
    const limitNum = limit ? Number(limit) : 5;
    return this.service.findTopLiked(limitNum, userId);
  }

  @ApiOperation({ summary: "Один опубликованный блог по ID" })
  @ApiParam({ name: "id", example: "uuid" })
  @ApiResponse({ status: 200, description: "Блог найден" })
  @ApiResponse({ status: 404, description: "Блог не найден" })
  @UseGuards(OptionalJwtAuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string, @Req() req?: any) {
    const userId = req?.user?.sub;
    return this.service.findOne(id, userId);
  }

  @ApiOperation({ summary: "Проверить, лайкнул ли текущий пользователь блог" })
  @ApiBearerAuth()
  @ApiParam({ name: "id", example: "uuid" })
  @ApiResponse({ status: 200, description: "Статус лайка" })
  @ApiResponse({ status: 401, description: "Не авторизован" })
  @ApiResponse({ status: 404, description: "Блог не найден" })
  @UseGuards(JwtAuthGuard)
  @Get(":id/likes/me")
  checkLikedByMe(@Param("id") id: string, @Req() req: any) {
    return this.service.checkLikedByMe(id, req.user.sub);
  }

  @ApiOperation({ summary: "Переключить лайк блога" })
  @ApiBearerAuth()
  @ApiParam({ name: "id", example: "uuid" })
  @ApiResponse({ status: 200, description: "Лайк переключен" })
  @ApiResponse({ status: 401, description: "Не авторизован" })
  @ApiResponse({ status: 404, description: "Блог не найден" })
  @UseGuards(JwtAuthGuard)
  @Post(":id/likes/toggle")
  toggleLike(@Param("id") id: string, @Req() req: any) {
    return this.service.toggleLike(id, req.user.sub);
  }
}
