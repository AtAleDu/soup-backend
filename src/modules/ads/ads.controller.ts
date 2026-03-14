import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { AdsService } from './ads.service'
import { GetAdsQueryDto } from './dto/get-ads-query.dto'

@ApiTags('Ads')
@Controller('ads')
export class AdsController {
  constructor(private readonly service: AdsService) {}

  @ApiOperation({ summary: 'Публичная выдача рекламы' })
  @ApiQuery({ name: 'placement', required: false })
  @ApiQuery({ name: 'adKind', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Get()
  getAds(@Query() query: GetAdsQueryDto) {
    return this.service.getPublicAds(query)
  }

  @ApiOperation({ summary: 'Трек клика по рекламе + редирект' })
  @Get(':id/click')
  async clickAndRedirect(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.service.registerClickAndGetRedirectUrl(id)
    return res.redirect(302, redirectUrl)
  }
}
