import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { CompanyBlogService, CompanyBlogStatus } from "./company-blog.service";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";

const VALID_STATUSES: CompanyBlogStatus[] = ["all", "published", "drafts"];

function parseStatus(status?: string): CompanyBlogStatus {
  if (status && VALID_STATUSES.includes(status as CompanyBlogStatus)) {
    return status as CompanyBlogStatus;
  }
  return "all";
}

@ApiTags("Profile")
@ApiBearerAuth()
@Controller("profile/company")
@UseGuards(JwtAuthGuard)
export class CompanyBlogController {
  constructor(private readonly service: CompanyBlogService) {}

  @ApiOperation({ summary: "Блоги компании: все / опубликованные / черновики" })
  @Get("blog")
  getBlogs(
    @Req() req: { user: { sub: string } },
    @Query("status") status?: string,
  ) {
    return this.service.getCompanyBlogs(req.user.sub, parseStatus(status));
  }

  @ApiOperation({ summary: "Создать блог (черновик)" })
  @Post("blog")
  create(
    @Req() req: { user: { sub: string } },
    @Body() dto: CreateBlogDto,
  ) {
    return this.service.create(req.user.sub, dto);
  }

  @ApiOperation({ summary: "Получить один блог компании" })
  @ApiParam({ name: "id", example: "uuid" })
  @Get("blog/:id")
  getOne(@Req() req: { user: { sub: string } }, @Param("id") id: string) {
    return this.service.getOne(req.user.sub, id);
  }

  @ApiOperation({ summary: "Редактировать черновик" })
  @ApiParam({ name: "id", example: "uuid" })
  @Patch("blog/:id")
  update(
    @Req() req: { user: { sub: string } },
    @Param("id") id: string,
    @Body() dto: UpdateBlogDto,
  ) {
    return this.service.update(req.user.sub, id, dto);
  }

  @ApiOperation({ summary: "Удалить блог" })
  @ApiParam({ name: "id", example: "uuid" })
  @Delete("blog/:id")
  delete(@Req() req: { user: { sub: string } }, @Param("id") id: string) {
    return this.service.delete(req.user.sub, id);
  }

  @ApiOperation({ summary: "Опубликовать черновик" })
  @ApiParam({ name: "id", example: "uuid" })
  @Post("blog/:id/publish")
  publish(@Req() req: { user: { sub: string } }, @Param("id") id: string) {
    return this.service.publish(req.user.sub, id);
  }
}