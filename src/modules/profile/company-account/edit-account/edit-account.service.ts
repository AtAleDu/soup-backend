import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Company } from '@entities/Company/company.entity'
import { CompanyStatus } from '@entities/Company/company-status.enum'
import { UpdateCompanyAccountDto } from '../dto/update-company-account.dto'
import { User } from '@entities/User/user.entity'
import { StorageService } from '@infrastructure/storage/storage.service'
import { UPLOAD_LOGO } from '@infrastructure/upload/upload-constraints'
import sharp from 'sharp'
import { GetCompanyProfileService } from '../get-profile/get-profile.service'

@Injectable()
export class EditCompanyAccountService {
  constructor(
    @InjectRepository(Company)
    private readonly repo: Repository<Company>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly storage: StorageService,
    private readonly profile: GetCompanyProfileService,
  ) {}

  async updateProfile(userId: string, dto: UpdateCompanyAccountDto) {
    const company = await this.profile.getProfile(userId)
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
          .slice(0, 1)
        updateData.phones = phones
      }
      // Поле почты не редактируется в ЛК, только при верификации
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

    const hasProfileUpdate =
      dto.profile !== undefined ||
      dto.contacts !== undefined ||
      dto.socials !== undefined ||
      dto.name !== undefined ||
      dto.description !== undefined ||
      dto.region !== undefined ||
      dto.regions !== undefined ||
      dto.activity_type !== undefined ||
      dto.website !== undefined ||
      dto.logo_url !== undefined ||
      dto.address !== undefined ||
      dto.social_links !== undefined

    const isLogoOnlyUpdate =
      dto.profile !== undefined &&
      dto.profile.logo !== undefined &&
      dto.profile.name === undefined &&
      dto.profile.description === undefined &&
      dto.profile.regions === undefined &&
      dto.profile.address === undefined &&
      dto.contacts === undefined &&
      dto.socials === undefined &&
      dto.name === undefined &&
      dto.description === undefined &&
      dto.region === undefined &&
      dto.regions === undefined &&
      dto.activity_type === undefined &&
      dto.website === undefined &&
      dto.logo_url === undefined &&
      dto.address === undefined &&
      dto.social_links === undefined

    if (hasProfileUpdate && !isLogoOnlyUpdate) {
      this.validateRequiredProfileFields(company, updateData)
    }

    if (dto.submit_for_moderation === true) {
      updateData.status = CompanyStatus.MODERATION
      updateData.rejectionReason = null
    }

    await this.repo.update({ userId }, updateData)

    const nextUserName = dto.profile?.name ?? dto.name
    if (nextUserName !== undefined) {
      // Синхронизируем имя пользователя с именем компании, если оно пришло.
      await this.users.update({ id: userId }, { name: nextUserName })
    }
    return this.profile.getProfile(userId)
  }

  private validateRequiredProfileFields(
    company: Company,
    updateData: Partial<Company>,
  ) {
    const phones = (updateData.phones ?? company.phones ?? []) as
      | Array<{ phone?: string | null }>
      | null
    const emails = (updateData.emails ?? company.emails ?? []) as
      | Array<string | null>
      | null
    const name = updateData.name ?? company.name
    const description = updateData.description ?? company.description
    const regions = (updateData.regions ?? company.regions ?? []) as
      | string[]
      | null

    const hasRequiredPhone = Array.isArray(phones)
      ? phones.some(
          (item) =>
            typeof item?.phone === 'string' && item.phone.trim().length > 0,
        )
      : false

    const hasRequiredEmail = Array.isArray(emails)
      ? emails.some(
          (value) => typeof value === 'string' && value.trim().length > 0,
        )
      : false

    const missingFields: string[] = []
    if (typeof name !== 'string' || name.trim().length === 0) missingFields.push('name')
    if (typeof description !== 'string' || description.trim().length === 0) {
      missingFields.push('description')
    }
    if (!Array.isArray(regions) || regions.length === 0) missingFields.push('regions')
    if (Array.isArray(regions) && regions.length > 3) {
      throw new BadRequestException('Можно указать не более 3 регионов')
    }
    if (!hasRequiredPhone) missingFields.push('phone')
    if (!hasRequiredEmail) missingFields.push('email')

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Обязательные поля не заполнены: ${missingFields.join(', ')}`,
      )
    }
  }

  async uploadCompanyLogo(userId: string, file) {
    if (!(UPLOAD_LOGO.allowedMimeTypes as readonly string[]).includes(file.mimetype)) {
      throw new BadRequestException('Недопустимый формат логотипа')
    }
    if (file.size > UPLOAD_LOGO.maxSizeBytes) {
      throw new BadRequestException('Размер файла превышает 2 МБ')
    }

    let resizedBuffer: Buffer
    try {
      const metadata = await sharp(file.buffer).metadata()
      const width = metadata.width ?? 0
      const height = metadata.height ?? 0
      if (
        width < UPLOAD_LOGO.minWidth ||
        height < UPLOAD_LOGO.minHeight ||
        width > UPLOAD_LOGO.maxWidth ||
        height > UPLOAD_LOGO.maxHeight
      ) {
        throw new BadRequestException('Размер логотипа должен быть от 16 до 512 пикселей')
      }

      resizedBuffer = await sharp(file.buffer)
        .resize(96, 96, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer()
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException('Некорректный файл изображения')
    }

    const uploadResult = await this.storage.upload(
      {
        buffer: resizedBuffer,
        mimeType: 'image/png',
        size: resizedBuffer.length,
        originalName: 'logo.png',
      },
      {
        allowedMimeTypes: ['image/png'],
        maxSizeBytes: UPLOAD_LOGO.maxSizeBytes,
        isPublic: true,
        pathPrefix: `personal-account/company-account/profile-logo/${userId}`,
      },
    )

    return uploadResult.url
  }
}
