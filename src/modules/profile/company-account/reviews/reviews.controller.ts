import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@modules/auth/jwt/jwt-auth.guard'
import { CompanyReviewsService } from './reviews.service'
import { ReplyCompanyReviewDto } from './dto/reply-company-review.dto'

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile/company')
@UseGuards(JwtAuthGuard)
export class CompanyReviewsController {
  constructor(private readonly service: CompanyReviewsService) {}

  @ApiOperation({ summary: 'Получить отзывы компании' })
  @Get('get-reviews')
  getReviews(@Req() req) {
    return this.service.getReviews(req.user.sub)
  }

  @ApiOperation({ summary: 'Ответить на отзыв компании' })
  @Post('review-reply')
  replyToReview(@Req() req, @Body() dto: ReplyCompanyReviewDto) {
    return this.service.replyToReview(req.user.sub, dto)
  }

  @ApiOperation({ summary: 'Получить ответ компании на отзыв' })
  @Get('review-reply/:reviewId')
  getReply(@Req() req, @Param('reviewId') reviewId: string) {
    return this.service.getReply(req.user.sub, Number(reviewId))
  }
}
