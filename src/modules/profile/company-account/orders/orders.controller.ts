import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@modules/auth/jwt/jwt-auth.guard'
import { CompanyOrdersService } from './orders.service'

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile/company')
@UseGuards(JwtAuthGuard)
export class CompanyOrdersController {
  constructor(private readonly service: CompanyOrdersService) {}

  @ApiOperation({ summary: 'Получить заказы компании' })
  @Get('orders')
  getOrders(
    @Req() req,
    @Query('status') status?: string,
    @Query('page') page?: string,
  ) {
    return this.service.getOrders(req.user.sub, { status, page })
  }
}
