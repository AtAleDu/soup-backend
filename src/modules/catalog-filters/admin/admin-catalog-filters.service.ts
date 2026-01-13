import { Injectable } from '@nestjs/common'
import { CreateCatalogFilterDto } from './dto/create-catalog-filter.dto'
import { UpdateCatalogFilterDto } from './dto/update-catalog-filter.dto'

@Injectable()
export class AdminCatalogFiltersService {
  findAll() {
    return { message: 'not implemented' }
  }

  create(dto: CreateCatalogFilterDto) {
    return { message: 'not implemented', dto }
  }

  update(id: string, dto: UpdateCatalogFilterDto) {
    return { message: 'not implemented', id, dto }
  }

  remove(id: string) {
    return { message: 'not implemented', id }
  }
}
