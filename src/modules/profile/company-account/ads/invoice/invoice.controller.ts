import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '@modules/auth/jwt/jwt-auth.guard';
import { AdsInvoiceService } from './invoice.service';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile/company/ads/invoice')
@UseGuards(JwtAuthGuard)
export class AdsInvoiceController {
  constructor(private readonly service: AdsInvoiceService) {}

  @ApiOperation({ summary: 'Выставить счёт: создать запись, сгенерировать и вернуть PDF' })
  @ApiResponse({ status: 200, description: 'PDF файл счёта' })
  @ApiResponse({ status: 400, description: 'Нет рекламодателя или пустая корзина' })
  @Post()
  async createInvoice(
    @Req() req: { user: { sub: string } },
    @Res() res: Response,
  ) {
    const { buffer, invoiceNumber } = await this.service.createInvoice(req.user.sub);
    const filename = `invoice-${invoiceNumber}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
