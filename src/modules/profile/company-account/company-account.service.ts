import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Company } from '@entities/Company/company.entity'
import { UpdateCompanyAccountDto } from './dto/update-company-account.dto'
import { User } from '@entities/User/user.entity'

@Injectable()
export class CompanyAccountService {
  constructor(
    @InjectRepository(Company)
    private readonly repo: Repository<Company>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async getProfile(userId: string) {
    const company = await this.repo.findOne({
      where: { userId },
    })
    if (!company) throw new NotFoundException('Комания не найдена')
    return company
  }

  async updateProfile(userId: string, dto: UpdateCompanyAccountDto) {
    const company = await this.getProfile(userId)
    // Собираем только переданные поля, чтобы не затирать существующие данные.
    const updateData: Partial<Company> = {}

    if (dto.profile) {
      // Блок профиля маппит вложенные поля DTO на колонки компании.
      if (dto.profile.logo !== undefined) updateData.logo_url = dto.profile.logo
      if (dto.profile.name !== undefined) updateData.name = dto.profile.name
      if (dto.profile.description !== undefined)
        updateData.description = dto.profile.description
      if (dto.profile.regions !== undefined)
        updateData.regions = dto.profile.regions
      if (dto.profile.address !== undefined)
        updateData.address = dto.profile.address
    }

    if (dto.contacts) {
      if (dto.contacts.phones !== undefined) {
        // Нормализуем телефоны под формат хранения и отбрасываем пустые.
        const phones = dto.contacts.phones
          .filter(
            (
              item,
            ): item is { phone: string; representativeName?: string } =>
              typeof item?.phone === 'string' && item.phone.trim() !== '',
          )
          .map((item) => ({
            phone: item.phone,
            representativeName: item.representativeName,
          }))
        updateData.phones = phones
      }
      if (dto.contacts.emails !== undefined) {
        const emails = dto.contacts.emails
          .filter(
            (value): value is string =>
              typeof value === 'string' && value.trim() !== '',
          )
          .slice(0, 2)
        updateData.emails = emails
        updateData.email = emails[0] ?? null
      } else if (dto.contacts.email !== undefined) {
        updateData.email = dto.contacts.email
        updateData.emails =
          dto.contacts.email && dto.contacts.email.trim() !== ''
            ? [dto.contacts.email]
            : []
      }
    }

    const legacySocialLinks = dto.social_links ?? {}
    // Сливаем legacy-поля соцсетей в новую структуру.
    if (dto.website !== undefined) legacySocialLinks.website = dto.website
    if (dto.socials?.yandexDzen)
      legacySocialLinks.yandexDzen = dto.socials.yandexDzen

    if (dto.socials || Object.keys(legacySocialLinks).length > 0) {
      updateData.social_links = {
        ...(company.social_links ?? {}),
        ...(dto.socials ?? {}),
        ...legacySocialLinks,
      }
    }

    if (dto.name !== undefined) updateData.name = dto.name
    if (dto.description !== undefined) updateData.description = dto.description
    if (dto.regions !== undefined) updateData.regions = dto.regions
    if (dto.region !== undefined) updateData.regions = [dto.region]
    if (dto.logo_url !== undefined) updateData.logo_url = dto.logo_url
    if (dto.address !== undefined) updateData.address = dto.address

    await this.repo.update({ userId }, updateData)

    const nextUserName = dto.profile?.name ?? dto.name
    if (nextUserName !== undefined) {
      // Синхронизируем имя пользователя с именем компании, если оно пришло.
      await this.users.update({ id: userId }, { name: nextUserName })
    }
    return this.getProfile(userId)
  }
}
