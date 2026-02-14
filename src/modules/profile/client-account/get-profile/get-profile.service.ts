import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Client } from "@entities/Client/client.entity";
import { Repository } from "typeorm";

@Injectable()
export class GetClientProfileService {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
  ) {}

  async getProfile(userId: string) {
    const client = await this.repo.findOne({
      where: { userId },
      relations: { user: true },
    });

    if (!client) throw new NotFoundException("Клиент не найден");

    const contacts = Array.isArray(client.contacts) ? [...client.contacts] : [];
    const hasEmailContact = contacts.some((item) => item?.type === "email");

    if (!hasEmailContact && client.user?.email) {
      contacts.push({
        type: "email",
        value: client.user.email,
      });
    }

    if (!Array.isArray(client.contacts) || !hasEmailContact) {
      await this.repo.update(
        { clientId: client.clientId },
        { contacts },
      );
      client.contacts = contacts;
    }

    return client;
  }
}
