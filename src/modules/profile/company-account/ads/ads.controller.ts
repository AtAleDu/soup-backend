import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@modules/auth/jwt/jwt-auth.guard'
import { CompanyAdsService } from './ads.service'
import { CompanyTariffsResponseDto } from './dto/company-tariffs.dto'
import { CompanyCurrentTariffResponseDto } from './dto/company-current-tariff.dto'
import { CompanyAdPositionsResponseDto } from './dto/company-ad-positions.dto'
import { CompanyAdsStatisticsResponseDto } from './dto/company-ads-statistics.dto'

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

  @ApiOperation({ summary: 'Получить список доступных позиций рекламы' })
  @ApiResponse({ status: 200, type: CompanyAdPositionsResponseDto })
  @Get('positions')
  getAdPositions(@Req() req) {
    return this.service.getAdPositions(req.user.sub)
  }

  @ApiOperation({ summary: 'Получить статистику кликов по рекламе компании' })
  @ApiResponse({ status: 200, type: CompanyAdsStatisticsResponseDto })
  // Доп. параметры:
  // - range: week | month | period
  // - from/to: ISO-строки для range=period
  @Get('statistics')
  getAdsStatistics(
    @Req() req,
    @Query('range') range?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<CompanyAdsStatisticsResponseDto> {
    return this.service.getAdsStatistics(req.user.sub, { range, from, to })
  }
}
