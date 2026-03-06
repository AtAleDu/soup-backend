import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { AdsService } from '../ads.service'
import { RejectAdDto } from '../dto/reject-ad.dto'

@ApiTags('AdsAdmin')
@Controller('admin/ads')
export class AdminAdsController {
  constructor(private readonly service: AdsService) {}

  @ApiOperation({ summary: 'Список рекламы для админки' })
  @ApiQuery({ name: 'status', required: false })
  @Get()
  getList(@Query('status') status?: string) {
    return this.service.getAdminList(status)
  }

  @ApiOperation({ summary: 'Одобрить рекламу' })
  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.service.approveAd(id)
  }

  @ApiOperation({ summary: 'Отклонить рекламу' })
  @Patch(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number, @Body() body: RejectAdDto) {
    return this.service.rejectAd(id, body.reason)
  }
}
