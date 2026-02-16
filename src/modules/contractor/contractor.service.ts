import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ContractorTypeEntity } from '@entities/Contractor/contractor-categories.entity'
import { ContractorSubcategoryEntity } from '@entities/Contractor/contractor-subcategory.entity'
import { ContractorTypeDto } from './dto/contractor.dto'
import {
  CreateContractorSubcategoryDto,
  CreateContractorTypeDto,
} from './dto/create-contractor.dto'
import { UpdateContractorTypeDto } from './dto/update-contractor.dto'

@Injectable()
export class ContractorService {
  constructor(
    @InjectRepository(ContractorTypeEntity)
    private readonly categoryRepo: Repository<ContractorTypeEntity>,
  ) { }

  private mapToDto(entity: ContractorTypeEntity): ContractorTypeDto {
    const subcategories = [...(entity.subcategories ?? [])]
      .sort((a, b) => a.title.localeCompare(b.title, 'ru', { sensitivity: 'base' }))
      .map((subcategory) => ({
        title: subcategory.title,
        logoUrl: subcategory.logoUrl,
        imageUrl: subcategory.imageUrl,
      }))

    return {
      title: entity.title,
      logoUrl: entity.logoUrl,
      subcategories,
    }
  }

  private normalizeSubcategories(
    subcategories: CreateContractorSubcategoryDto[],
  ): ContractorSubcategoryEntity[] {
    const items = subcategories
      .map((subcategory) => ({
        title: subcategory.title.trim(),
        logoUrl: subcategory.logoUrl?.trim() || null,
        imageUrl: subcategory.imageUrl?.trim() || null,
      }))
      .filter((subcategory) => subcategory.title.length > 0)

    const uniqueTitles = new Set(
      items.map((subcategory) => subcategory.title.toLocaleLowerCase('ru-RU')),
    )

    if (items.length === 0) {
      throw new BadRequestException('Список сабкатегорий не может быть пустым')
    }

    if (uniqueTitles.size !== items.length) {
      throw new BadRequestException('Сабкатегории внутри категории должны быть уникальными')
    }

    return items as ContractorSubcategoryEntity[]
  }

  async getTypes(): Promise<ContractorTypeDto[]> {
    const categories = await this.categoryRepo.find({
      relations: { subcategories: true },
      order: { title: 'ASC', subcategories: { title: 'ASC' } },
    })

    return categories.map((category) => this.mapToDto(category))
  }

  async getOne(id: string): Promise<ContractorTypeDto> {
    const entity = await this.categoryRepo.findOne({
      where: { id },
      relations: { subcategories: true },
    })

    if (!entity) {
      throw new NotFoundException('Категория подрядчиков не найдена')
    }

    return this.mapToDto(entity)
  }

  async create(dto: CreateContractorTypeDto): Promise<ContractorTypeDto> {
    const title = dto.title.trim()
    const exists = await this.categoryRepo.findOne({ where: { title } })
    if (exists) {
      throw new BadRequestException('Категория с таким названием уже существует')
    }

    const saved = await this.categoryRepo.save({
      title,
      logoUrl: dto.logoUrl?.trim() || null,
      subcategories: this.normalizeSubcategories(dto.subcategories),
    })

    const category = await this.categoryRepo.findOne({
      where: { id: saved.id },
      relations: { subcategories: true },
    })

    if (!category) {
      throw new NotFoundException('Категория подрядчиков не найдена')
    }

    return this.mapToDto(category)
  }

  async update(id: string, dto: UpdateContractorTypeDto): Promise<ContractorTypeDto> {
    const entity = await this.categoryRepo.findOne({
      where: { id },
      relations: { subcategories: true },
    })
    if (!entity) throw new NotFoundException('Категория подрядчиков не найдена')

    if (dto.title && dto.title !== entity.title) {
      const duplicate = await this.categoryRepo.findOne({ where: { title: dto.title.trim() } })
      if (duplicate) {
        throw new BadRequestException('Категория с таким названием уже существует')
      }
    }

    if (dto.title !== undefined) {
      entity.title = dto.title.trim()
    }

    if (dto.logoUrl !== undefined) {
      entity.logoUrl = dto.logoUrl?.trim() || null
    }

    if (dto.subcategories !== undefined) {
      entity.subcategories = this.normalizeSubcategories(dto.subcategories)
    }

    const saved = await this.categoryRepo.save(entity)
    const category = await this.categoryRepo.findOne({
      where: { id: saved.id },
      relations: { subcategories: true },
    })

    if (!category) {
      throw new NotFoundException('Категория подрядчиков не найдена')
    }

    return this.mapToDto(category)
  }

  async remove(id: string): Promise<void> {
    const entity = await this.categoryRepo.findOne({ where: { id } })
    if (!entity) throw new NotFoundException('Категория подрядчиков не найдена')

    await this.categoryRepo.delete(id)
  }
}
