import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ContractorTypeEntity } from '@entities/Contractor/contractor-type.entity'
import { ContractorTypeDto } from './dto/contractor-type.dto'
import { CreateContractorTypeDto } from './dto/create-contractor-type.dto'
import { UpdateContractorTypeDto } from './dto/update-contractor-type.dto'
import { AdminContractorTypeDto } from './dto/admin-contractor-type.dto'


@Injectable()
export class ContractorService {
  constructor(
    @InjectRepository(ContractorTypeEntity)
    private readonly repo: Repository<ContractorTypeEntity>,
  ) {}

  async getTypes(): Promise<ContractorTypeDto[]> {
    const types = await this.repo.find({ order: { title: 'ASC' } })
    return types.map(({ title, badges }) => ({ title, badges }))
  }

  async create(dto: CreateContractorTypeDto): Promise<ContractorTypeDto> {
    const exists = await this.repo.findOne({ where: { title: dto.title } })
    if (exists) {
      throw new BadRequestException('Тип подрядчика с таким названием уже существует')
    }

    const saved = await this.repo.save({
      title: dto.title,
      badges: dto.badges,
    })

    return { title: saved.title, badges: saved.badges }
  }

  async update(id: string, dto: UpdateContractorTypeDto): Promise<ContractorTypeDto> {
    const entity = await this.repo.findOne({ where: { id } })
    if (!entity) throw new NotFoundException('Тип подрядчика не найден')

    if (dto.title && dto.title !== entity.title) {
      const duplicate = await this.repo.findOne({ where: { title: dto.title } })
      if (duplicate) {
        throw new BadRequestException('Тип подрядчика с таким названием уже существует')
      }
    }

    const merged = this.repo.merge(entity, {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.badges !== undefined ? { badges: dto.badges } : {}),
    })

    const saved = await this.repo.save(merged)
    return { title: saved.title, badges: saved.badges }
  }

  async remove(id: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } })
    if (!entity) throw new NotFoundException('Тип подрядчика не найден')

    await this.repo.delete(id)
  }

  async getAllForAdmin(): Promise<AdminContractorTypeDto[]> {
  const types = await this.repo.find({
    order: { title: 'ASC' },
  })

  return types.map(({ id, title, badges }) => ({
    id,
    title,
    badges,
  }))
}


}
