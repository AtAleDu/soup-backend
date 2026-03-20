import { Body, Controller, Delete, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/jwt/jwt-auth.guard';
import { CompanyAdsAdvertiserService } from './advertiser.service';
import { SaveAdvertiserDto } from './dto/save-advertiser.dto';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile/company/ads/advertiser')
@UseGuards(JwtAuthGuard)
export class CompanyAdsAdvertiserController {
  constructor(private readonly service: CompanyAdsAdvertiserService) {}

  @ApiOperation({ summary: 'Получить сохранённого рекламодателя компании' })
  @ApiResponse({ status: 200, description: 'Рекламодатель или пусто' })
  @Get()
  getAdvertiser(@Req() req: { user: { sub: string } }) {
    return this.service.getAdvertiser(req.user.sub);
  }

  @ApiOperation({ summary: 'Сохранить или обновить рекламодателя' })
  @ApiResponse({ status: 200, description: 'Сохранённый рекламодатель' })
  @Put()
  saveAdvertiser(
    @Req() req: { user: { sub: string } },
    @Body() dto: SaveAdvertiserDto,
  ) {
    return this.service.saveAdvertiser(req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Удалить рекламодателя компании' })
  @ApiResponse({ status: 200, description: 'Удалено' })
  @Delete()
  async deleteAdvertiser(@Req() req: { user: { sub: string } }) {
    await this.service.deleteAdvertiser(req.user.sub);
  }
}