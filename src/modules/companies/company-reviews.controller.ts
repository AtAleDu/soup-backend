import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/jwt/jwt-auth.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guard";
import { Roles } from "@modules/auth/guards/roles.decorator";
import { Public } from "@modules/auth/public.decorator";
import { CompanyReviewsService } from "./company-reviews.service";
import { CreateCompanyReviewDto } from "./dto/create-company-review.dto";

@ApiTags("Companies")
@Controller("companies/:companyId/reviews")
export class CompanyReviewsController {
  constructor(private readonly service: CompanyReviewsService) {}

  @Public()
  @ApiOperation({ summary: "Список отзывов компании (публичный)" })
  @Get()
  getReviews(@Param("companyId", ParseIntPipe) companyId: number) {
    return this.service.getReviewsByCompanyId(companyId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Оставить отзыв (только клиент)" })
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("client")
  createReview(
    @Param("companyId", ParseIntPipe) companyId: number,
    @Req() req: { user: { sub: string } },
    @Body() dto: CreateCompanyReviewDto,
  ) {
    return this.service.createReview(companyId, req.user.sub, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Загрузить фото к отзыву" })
  @Post(":reviewId/upload-image")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("client")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: memoryStorage(),
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { image: { type: "string", format: "binary" } },
    },
  })
  uploadImage(
    @Param("companyId", ParseIntPipe) companyId: number,
    @Param("reviewId", ParseIntPipe) reviewId: number,
    @Req() req: { user: { sub: string } },
    @UploadedFile() file,
  ) {
    return this.service.uploadReviewImage(
      companyId,
      reviewId,
      req.user.sub,
      file,
    );
  }
}
