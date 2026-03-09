import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Client } from "@entities/Client/client.entity";
import { ClientStatus } from "@entities/Client/client-status.enum";
import { Repository } from "typeorm";
import { StorageService } from "@infrastructure/storage/storage.service";
import { UPLOAD_IMAGE } from "@infrastructure/upload/upload-constraints";
import { UpdateClientAccountDto } from "../dto/update-client-account.dto";

@Injectable()
export class EditClientAccountService {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
    private readonly storage: StorageService,
  ) {}

  async updateProfile(userId: string, dto: UpdateClientAccountDto) {
    let client = await this.repo.findOne({ where: { userId } });

    if (!client) {
      client = this.repo.create({ userId });
      client = await this.repo.save(client);
    }

    const updateData: Partial<Client> = {};

    if (dto.profile) {
      if (dto.profile.full_name !== undefined) {
        updateData.full_name = dto.profile.full_name;
      }
      if (dto.profile.city !== undefined) {
        updateData.city = dto.profile.city;
      }
      if (dto.profile.avatar_url !== undefined) {
        updateData.avatar_url = dto.profile.avatar_url;
      }
    }

    if (dto.contacts !== undefined) {
      updateData.contacts = dto.contacts.filter(
        (item) => typeof item.value === "string" && item.value.trim() !== "",
      );
    }

    if (dto.notification_settings) {
      updateData.notification_settings = {
        sms: Boolean(dto.notification_settings.sms),
        email: Boolean(dto.notification_settings.email),
      };
    }

    if (dto.privacy_settings) {
      updateData.privacy_settings = {
        phone: Boolean(dto.privacy_settings.phone),
        email: Boolean(dto.privacy_settings.email),
        social_links: Boolean(dto.privacy_settings.social_links),
      };
    }

    if (dto.submit_for_moderation === true) {
      updateData.status = ClientStatus.MODERATION;
      updateData.rejection_reason = null;
    }

    await this.repo.update({ userId }, updateData);
    return this.repo.findOne({ where: { userId } });
  }

  async uploadClientAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ avatar_url: string }> {
    if (!file?.buffer) {
      throw new BadRequestException("Файл не передан");
    }
    if (!(UPLOAD_IMAGE.allowedMimeTypes as readonly string[]).includes(file.mimetype)) {
      throw new BadRequestException(
        "Недопустимый формат. Разрешены: PNG, JPEG, WebP, SVG",
      );
    }
    if (file.size > UPLOAD_IMAGE.maxSizeBytes) {
      throw new BadRequestException("Размер файла превышает 5 МБ");
    }

    let client = await this.repo.findOne({ where: { userId } });
    if (!client) {
      client = this.repo.create({ userId });
      await this.repo.save(client);
    }

    const ext = file.originalname?.match(/\.[a-z]+$/i)?.[0] ?? ".jpg";
    const uploadResult = await this.storage.upload(
      {
        buffer: file.buffer,
        mimeType: file.mimetype,
        size: file.size,
        originalName: `avatar${ext}`,
      },
      {
        allowedMimeTypes: [...UPLOAD_IMAGE.allowedMimeTypes],
        maxSizeBytes: UPLOAD_IMAGE.maxSizeBytes,
        isPublic: true,
        pathPrefix: `personal-account/client-account/avatar/${userId}`,
      },
    );

    await this.repo.update({ userId }, { avatar_url: uploadResult.url });
    return { avatar_url: uploadResult.url };
  }
}
