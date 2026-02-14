import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { FavoritesService } from "./favorites.service";

@ApiTags("Favorites")
@ApiBearerAuth()
@Controller("favorites")
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly service: FavoritesService) {}

  @ApiOperation({ summary: "Добавить компанию в избранное" })
  @ApiResponse({ status: 201, description: "Добавлено в избранное" })
  @ApiResponse({ status: 401, description: "Не авторизован" })
  @ApiResponse({ status: 404, description: "Компания не найдена" })
  @Post(":companyId")
  add(@Req() req: { user: { sub: string } }, @Param("companyId", ParseIntPipe) companyId: number) {
    return this.service.add(req.user.sub, companyId);
  }

  @ApiOperation({ summary: "Убрать компанию из избранного" })
  @ApiResponse({ status: 200, description: "Удалено из избранного" })
  @ApiResponse({ status: 401, description: "Не авторизован" })
  @Delete(":companyId")
  remove(
    @Req() req: { user: { sub: string } },
    @Param("companyId", ParseIntPipe) companyId: number,
  ) {
    return this.service.remove(req.user.sub, companyId);
  }

  @ApiOperation({ summary: "Список id компаний в избранном" })
  @ApiResponse({ status: 200, description: "Список companyIds" })
  @ApiResponse({ status: 401, description: "Не авторизован" })
  @Get()
  list(@Req() req: { user: { sub: string } }) {
    return this.service.list(req.user.sub);
  }

  @ApiOperation({ summary: "Проверить, в избранном ли компания" })
  @ApiResponse({ status: 200, description: "true/false" })
  @ApiResponse({ status: 401, description: "Не авторизован" })
  @Get("check/:companyId")
  check(
    @Req() req: { user: { sub: string } },
    @Param("companyId", ParseIntPipe) companyId: number,
  ) {
    return this.service.isFavorite(req.user.sub, companyId);
  }
}
