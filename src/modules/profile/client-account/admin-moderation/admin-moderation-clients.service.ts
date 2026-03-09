import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Client } from "@entities/Client/client.entity";
import { ClientStatus } from "@entities/Client/client-status.enum";
import { Repository } from "typeorm";
import { UpdateClientModerationDto } from "../dto/update-client-moderation.dto";

@Injectable()
export class AdminModerationClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
  ) {}

  async getModerationClients() {
    const clients = await this.repo.find({
      where: { status: ClientStatus.MODERATION },
      relations: { user: true },
      select: {
        clientId: true,
        full_name: true,
        createdAt: true,
        user: { id: true, name: true, email: true },
      },
      order: { updatedAt: "DESC" },
    });

    return clients.map((c) => ({
      id: c.clientId,
      full_name: c.full_name ?? c.user?.name ?? null,
      email: c.user?.email ?? null,
      createdAt: c.createdAt,
    }));
  }

  async getModerationClient(clientId: number) {
    const client = await this.repo.findOne({
      where: { clientId, status: ClientStatus.MODERATION },
      relations: { user: true },
    });

    if (!client) {
      throw new NotFoundException("Клиент на модерации не найден");
    }

    return {
      clientId: client.clientId,
      userId: client.userId,
      full_name: client.full_name,
      city: client.city,
      avatar_url: client.avatar_url,
      contacts: client.contacts,
      status: client.status,
      createdAt: client.createdAt,
      user: client.user
        ? {
            id: client.user.id,
            name: client.user.name,
            email: client.user.email,
          }
        : null,
    };
  }

  async moderateClient(
    clientId: number,
    dto: UpdateClientModerationDto,
  ): Promise<{ success: true }> {
    const client = await this.repo.findOne({ where: { clientId } });
    if (!client) {
      throw new NotFoundException("Клиент не найден");
    }
    if (client.status !== ClientStatus.MODERATION) {
      throw new BadRequestException("Клиент уже прошёл модерацию");
    }
    if (dto.status === "rejected" && !dto.rejectionReason?.trim()) {
      throw new BadRequestException("Укажите причину отказа");
    }

    client.status =
      dto.status === "active" ? ClientStatus.ACTIVE : ClientStatus.REJECTED;
    client.rejection_reason =
      dto.status === "rejected" ? dto.rejectionReason?.trim() ?? null : null;
    await this.repo.save(client);
    return { success: true };
  }
}
