import {
  ForbiddenException,
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Favorite } from "@entities/Favorite/favorite.entity";
import { Company } from "@entities/Company/company.entity";
import { CompanyStatus } from "@entities/Company/company-status.enum";
import { Client } from "@entities/Client/client.entity";
import { ClientStatus } from "@entities/Client/client-status.enum";

const FAVORITES_FORBIDDEN =
  "Добавлять в избранное могут только пользователи, которые прошли модерацию";

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
  ) {}

  private async ensureUserCanUseFavorites(userId: string): Promise<void> {
    const client = await this.clientRepo.findOne({ where: { userId } });
    if (client) {
      if (client.status !== ClientStatus.ACTIVE) {
        throw new ForbiddenException(FAVORITES_FORBIDDEN);
      }
      return;
    }
    const company = await this.companyRepo.findOne({ where: { userId } });
    if (company?.status === CompanyStatus.ACTIVE) return;
    throw new ForbiddenException(FAVORITES_FORBIDDEN);
  }

  async add(userId: string, companyId: number): Promise<{ added: true }> {
    await this.ensureUserCanUseFavorites(userId);

    const company = await this.companyRepo.findOne({ where: { companyId } });
    if (!company) throw new NotFoundException("Компания не найдена");

    const existing = await this.favoriteRepo.findOne({
      where: { userId, companyId },
    });
    if (existing) throw new ConflictException("Уже в избранном");

    await this.favoriteRepo.save({ userId, companyId });
    return { added: true };
  }

  async remove(userId: string, companyId: number): Promise<{ removed: true }> {
    await this.ensureUserCanUseFavorites(userId);
    const result = await this.favoriteRepo.delete({ userId, companyId });
    if (result.affected === 0)
      throw new NotFoundException("Не найдено в избранном");
    return { removed: true };
  }

  async list(userId: string): Promise<{ companyIds: number[] }> {
    await this.ensureUserCanUseFavorites(userId);
    const rows = await this.favoriteRepo.find({
      where: { userId },
      select: ["companyId"],
      order: { createdAt: "DESC" },
    });
    return { companyIds: rows.map((r) => r.companyId) };
  }
}
