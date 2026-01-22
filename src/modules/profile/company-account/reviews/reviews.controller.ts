import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@modules/auth/jwt/jwt-auth.guard'
import { CompanyReviewsService } from './reviews.service'

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
}
