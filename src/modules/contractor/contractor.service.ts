import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ContractorTypeEntity } from '@entities/Contractor/contractor.entity'
import { ContractorTypeDto } from './dto/contractor.dto'
import { CreateContractorTypeDto } from './dto/create-contractor.dto'
import { UpdateContractorTypeDto } from './dto/update-contractor.dto'

@Injectable()
export class ContractorService {
  constructor(
    @InjectRepository(ContractorTypeEntity)
    private readonly repo: Repository<ContractorTypeEntity>,
  ) {}

  // PUBLIC: получить всех
  async getTypes(): Promise<ContractorTypeDto[]> {
    const types = await this.repo.find({ order: { title: 'ASC' } })
    return types.map(({ title, badges }) => ({ title, badges }))
  }

  // PUBLIC: получить одного
  async getOne(id: string): Promise<ContractorTypeDto> {
    const entity = await this.repo.findOne({ where: { id } })
    if (!entity) {
      throw new NotFoundException('Подрядчик не найден')
    }

    return {
      title: entity.title,
      badges: entity.badges,
    }
  }

  // ADMIN: создать
  async create(dto: CreateContractorTypeDto): Promise<ContractorTypeDto> {
    const exists = await this.repo.findOne({ where: { title: dto.title } })
    if (exists) {
      throw new BadRequestException('Подрядчик с таким названием уже существует')
    }

    const saved = await this.repo.save({
      title: dto.title,
      badges: dto.badges,
    })

    return { title: saved.title, badges: saved.badges }
  }

  // ADMIN: обновить
  async update(id: string, dto: UpdateContractorTypeDto): Promise<ContractorTypeDto> {
    const entity = await this.repo.findOne({ where: { id } })
    if (!entity) throw new NotFoundException('Подрядчик не найден')

    if (dto.title && dto.title !== entity.title) {
      const duplicate = await this.repo.findOne({ where: { title: dto.title } })
      if (duplicate) {
        throw new BadRequestException('Подрядчик с таким названием уже существует')
      }
    }

    const merged = this.repo.merge(entity, {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.badges !== undefined ? { badges: dto.badges } : {}),
    })

    const saved = await this.repo.save(merged)
    return { title: saved.title, badges: saved.badges }
  }

  // ADMIN: удалить
  async remove(id: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } })
    if (!entity) throw new NotFoundException('Подрядчик не найден')

    await this.repo.delete(id)
  }
}
