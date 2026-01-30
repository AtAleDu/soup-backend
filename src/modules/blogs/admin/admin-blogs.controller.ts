import { Controller, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { BlogsService } from "../blogs.service";

@ApiTags("Blogs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("admin/blogs")
export class AdminBlogsController {
  constructor(private readonly service: BlogsService) {}

  @ApiOperation({ summary: "Закрепить блог на странице блогов (admin)" })
  @ApiParam({ name: "id", example: "uuid" })
  @Patch(":id/pin")
  pin(@Param("id") id: string) {
    return this.service.pin(id);
  }

  @ApiOperation({ summary: "Открепить блог (admin)" })
  @ApiParam({ name: "id", example: "uuid" })
  @Patch(":id/unpin")
  unpin(@Param("id") id: string) {
    return this.service.unpin(id);
  }
}