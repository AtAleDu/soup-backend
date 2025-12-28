import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common'
import { NewsService } from './news.service'

@Controller('news')
export class NewsController {
  constructor(private readonly service: NewsService) {}

  @Post()
  create(@Body() body: {
    image: string
    imageAlt: string
    category: string
    title: string
    description?: string
    date?: string
    content?: string[]
    isAds?: boolean
    isImportantNew?: boolean
  }) {
    return this.service.create({
      image: body.image,
      imageAlt: body.imageAlt,
      category: body.category,
      title: body.title,
      description: body.description,
      date: body.date,
      content: body.content,
      isAds: body.isAds,
      isImportantNew: body.isImportantNew,
    })
  }

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      image?: string
      imageAlt?: string
      category?: string
      title?: string
      description?: string
      date?: string
      content?: string[]
      isAds?: boolean
      isImportantNew?: boolean
    },
  ) {
    return this.service.update(+id, body)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id)
  }
}
