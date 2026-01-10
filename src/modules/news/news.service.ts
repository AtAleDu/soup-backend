import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { NewsEntity } from '@entities/News/news.entity'
import { CreateNewsDto } from './dto/create-news.dto'
import { UpdateNewsDto } from './dto/update-news.dto'

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly repo: Repository<NewsEntity>,
  ) {}

  async create(dto: CreateNewsDto) {
    const news = this.repo.create(dto)
    return this.repo.save(news)
  }

  async findAll() {
    return this.repo.find({
      order: { id: 'DESC' },
    })
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } })
    if (!item) throw new NotFoundException('News not found')
    return item
  }

  async update(id: string, dto: UpdateNewsDto) {
    const item = await this.findOne(id)
    Object.assign(item, dto)
    return this.repo.save(item)
  }

  async remove(id: string) {
    const item = await this.findOne(id)
    await this.repo.remove(item)
    return { success: true }
  }
}
