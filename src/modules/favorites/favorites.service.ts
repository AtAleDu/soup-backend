import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Favorite } from "@entities/Favorite/favorite.entity";
import { Company } from "@entities/Company/company.entity";

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async add(userId: string, companyId: number): Promise<{ added: true }> {
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
    const result = await this.favoriteRepo.delete({ userId, companyId });
    if (result.affected === 0) throw new NotFoundException("Не найдено в избранном");
    return { removed: true };
  }

  async list(userId: string): Promise<{ companyIds: number[] }> {
    const rows = await this.favoriteRepo.find({
      where: { userId },
      select: ["companyId"],
      order: { createdAt: "DESC" },
    });
    return { companyIds: rows.map((r) => r.companyId) };
  }

  async isFavorite(userId: string, companyId: number): Promise<{ isFavorite: boolean }> {
    const exists = await this.favoriteRepo.findOne({
      where: { userId, companyId },
      select: ["id"],
    });
    return { isFavorite: !!exists };
  }
}
