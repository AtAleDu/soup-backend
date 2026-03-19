import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/jwt/jwt-auth.guard';
import { AdsInvoiceService } from './invoice.service';
import { AdsInvoiceStatus } from '@entities/AdsInvoice/ads-invoice-status.enum';
import type { AdsInvoiceStatusValue } from '@entities/AdsInvoice/ads-invoice-status.enum';

@ApiTags('AdsInvoicesAdmin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/ads/invoices')
export class AdminAdsInvoicesController {
  constructor(private readonly service: AdsInvoiceService) {}

  @ApiOperation({ summary: 'Список счетов на рекламу (admin)' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: Object.values(AdsInvoiceStatus),
  })
  @ApiResponse({ status: 200, description: 'Список счетов' })
  @Get()
  async findAll(
    @Query('status') status?: AdsInvoiceStatusValue,
  ) {
    return this.service.findForAdmin(status);
  }

  @ApiOperation({ summary: 'Получить подписанную ссылку на PDF счёта (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Подписанная ссылка на PDF' })
  @Get(':id/pdf-url')
  async getPdfUrl(
    @Param('id', ParseIntPipe) id: number,
  ) {
    const url = await this.service.getPdfSignedUrlForAdmin(id);
    return { url };
  }

  @ApiOperation({ summary: 'Подтвердить оплату счёта и активировать тариф (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Оплата подтверждена' })
  @Patch(':id/confirm-paid')
  async confirmPaid(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.confirmPaidByAdmin(id);
  }

  @ApiOperation({ summary: 'Отклонить счёт (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Счёт отклонён' })
  @Patch(':id/reject')
  async reject(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.rejectByAdmin(id);
  }
}

