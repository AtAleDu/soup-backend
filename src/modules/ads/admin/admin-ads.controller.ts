import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { AdsService } from '../ads.service'
import { RejectAdDto } from '../dto/reject-ad.dto'
import { CreateAdminAdDto } from '../dto/create-admin-ad.dto'
import { UpdateAdminAdDto } from '../dto/update-admin-ad.dto'

@ApiTags('AdsAdmin')
@Controller('admin/ads')
export class AdminAdsController {
  constructor(private readonly service: AdsService) {}

  @ApiOperation({ summary: 'Список рекламы для админки' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'placement', required: false })
  @Get()
  getList(@Query('status') status?: string, @Query('placement') placement?: string) {
    return this.service.getAdminList(status, placement)
  }

  @ApiOperation({ summary: 'Создать рекламу из админки' })
  @Post()
  create(@Body() body: CreateAdminAdDto) {
    return this.service.createAdminAd(body)
  }

  @ApiOperation({ summary: 'Загрузить изображение для рекламы из админки' })
  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.service.uploadAdminAdImage(file)
  }

  @ApiOperation({ summary: 'Обновить рекламу из админки' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateAdminAdDto) {
    return this.service.updateAdminAd(id, body)
  }

  @ApiOperation({ summary: 'Переключить активность рекламы' })
  @Patch(':id/toggle')
  toggle(@Param('id', ParseIntPipe) id: number) {
    return this.service.toggleAdminAd(id)
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

  @ApiOperation({ summary: 'Удалить рекламу из админки' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteAdminAd(id)
  }
}
