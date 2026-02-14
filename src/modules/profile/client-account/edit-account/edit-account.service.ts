import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Client } from "@entities/Client/client.entity";
import { Repository } from "typeorm";
import { UpdateClientAccountDto } from "../dto/update-client-account.dto";

@Injectable()
export class EditClientAccountService {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
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

    await this.repo.update({ userId }, updateData);
    return this.repo.findOne({ where: { userId } });
  }
}
