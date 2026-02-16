import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
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

  @ApiOperation({ summary: "Загрузить изображение" })
  @Post("blog/upload-image")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: memoryStorage(),
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({ schema: { type: "object", properties: { image: { type: "string", format: "binary" } } } })
  uploadImage(
    @Req() req: { user: { sub: string } },
    @UploadedFile() file,
  ) {
    return this.service.uploadBlogImage(req.user.sub, file);
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

  @ApiOperation({ summary: "Закрепить блог среди блогов компании" })
  @ApiParam({ name: "id", example: "uuid" })
  @Post("blog/:id/pin-by-company")
  pinByCompany(@Req() req: { user: { sub: string } }, @Param("id") id: string) {
    return this.service.pinByCompany(req.user.sub, id);
  }

  @ApiOperation({ summary: "Открепить блог среди блогов компании" })
  @ApiParam({ name: "id", example: "uuid" })
  @Post("blog/:id/unpin-by-company")
  unpinByCompany(@Req() req: { user: { sub: string } }, @Param("id") id: string) {
    return this.service.unpinByCompany(req.user.sub, id);
  }
}