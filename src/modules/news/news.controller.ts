import {Controller,Get,Post,Put,Delete,Body,Param,UseGuards,} from '@nestjs/common'
import {ApiTags,ApiOperation,ApiResponse,ApiParam,ApiBearerAuth,} from '@nestjs/swagger'
import { NewsService } from './news.service'
import { CreateNewsDto } from './dto/create-news.dto'
import { UpdateNewsDto } from './dto/update-news.dto'
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard'

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly service: NewsService) {}

  @ApiOperation({ summary: 'Создание новости' })
  @ApiResponse({ status: 201, description: 'Новость успешно создана' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: CreateNewsDto) {
    return this.service.create(body)
  }

  @ApiOperation({ summary: 'Получить список новостей' })
  @ApiResponse({ status: 200, description: 'Список новостей' })
  @Get()
  findAll() {
    return this.service.findAll()
  }

  @ApiOperation({ summary: 'Получить новость по ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Новость найдена' })
  @ApiResponse({ status: 404, description: 'Новость не найдена' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id)
  }

  @ApiOperation({ summary: 'Обновить новость' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Новость обновлена' })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateNewsDto,
  ) {
    return this.service.update(+id, body)
  }

  @ApiOperation({ summary: 'Удалить новость' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Новость удалена' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id)
  }
}
