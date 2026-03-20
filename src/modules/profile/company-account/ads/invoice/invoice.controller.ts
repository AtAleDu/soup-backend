import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
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

  @ApiOperation({ summary: 'Счета компании (ожидание оплаты / просрочка в окне показа)' })
  @ApiResponse({ status: 200, description: 'Список счетов' })
  @Get()
  async list(@Req() req: { user: { sub: string } }) {
    return this.service.findForCompany(req.user.sub);
  }

  @ApiOperation({ summary: 'Подписанная ссылка на PDF (5 мин), только свои счета' })
  @ApiResponse({ status: 200, description: 'url' })
  @Get(':id/pdf-url')
  async getPdfUrl(
    @Req() req: { user: { sub: string } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const url = await this.service.getPdfSignedUrlForCompany(req.user.sub, id);
    return { url };
  }

  @ApiOperation({ summary: 'Компания отметила перевод как «Оплачено»' })
  @ApiResponse({ status: 200, description: 'Счёт в очереди админа' })
  @Patch(':id/mark-company-paid')
  async markCompanyPaid(
    @Req() req: { user: { sub: string } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.markPaidByCompany(req.user.sub, id);
  }

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
