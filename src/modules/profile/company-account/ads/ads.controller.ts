import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@modules/auth/jwt/jwt-auth.guard'
import { CompanyAdsService } from './ads.service'
import { CompanyTariffsResponseDto } from './dto/company-tariffs.dto'
import { CompanyCurrentTariffResponseDto } from './dto/company-current-tariff.dto'

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile/company/ads')
@UseGuards(JwtAuthGuard)
export class CompanyAdsController {
  constructor(private readonly service: CompanyAdsService) {}

  @ApiOperation({ summary: 'Получить тарифы для рекламы компании' })
  @ApiResponse({ status: 200, type: CompanyTariffsResponseDto })
  @Get('tariffs')
  getTariffs(@Req() req) {
    return this.service.getCompanyTariffs(req.user.sub)
  }

  @ApiOperation({ summary: 'Получить текущий тариф компании' })
  @ApiResponse({ status: 200, type: CompanyCurrentTariffResponseDto })
  @Get('current-tariff')
  getCurrentTariff(@Req() req) {
    return this.service.getCurrentTariff(req.user.sub)
  }
}
