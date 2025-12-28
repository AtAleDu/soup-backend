import { Injectable, NotFoundException } from '@nestjs/common'
import { News } from './news.model'

@Injectable()
export class NewsService {
  private news: News[] = []
  private id = 1

  create(data: Omit<News, 'id'>) {
    const item: News = {
      id: this.id++,
      ...data,
    }
    this.news.push(item)
    return item
  }

  findAll() {
    return this.news
  }

  findOne(id: number) {
    const item = this.news.find(n => n.id === id)
    if (!item) {
      throw new NotFoundException('News not found')
    }
    return item
  }

  update(id: number, data: Partial<Omit<News, 'id'>>) {
    const item = this.findOne(id)
    Object.assign(item, data)
    return item
  }

  remove(id: number) {
    const index = this.news.findIndex(n => n.id === id)
    if (index === -1) {
      throw new NotFoundException('News not found')
    }
    return this.news.splice(index, 1)[0]
  }
}
