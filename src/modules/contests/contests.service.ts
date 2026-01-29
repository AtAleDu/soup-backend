import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, MoreThanOrEqual, Repository } from "typeorm";
import { Contest } from "@entities/Contest/contest.entity";
import { CreateContestDto } from "./dto/create-contest.dto";
import { UpdateContestDto } from "./dto/update-contest.dto";

@Injectable()
export class ContestsService {
  constructor(
    @InjectRepository(Contest)
    private readonly repo: Repository<Contest>,
  ) {}

  // PUBLIC: получить ВСЕ конкурсы (текущие + прошедшие)
  async findAllPublished() {
    const today = new Date().toISOString().slice(0, 10);

    return this.repo.find({
      where: [
        { endDate: MoreThanOrEqual(today) }, // текущие
        { endDate: LessThan(today) },        // прошедшие
      ],
      order: { startDate: "DESC" },
    });
  }

  // PUBLIC: получить текущие конкурсы
  async findCurrentPublished() {
    const today = new Date().toISOString().slice(0, 10);

    return this.repo.find({
      where: {
        endDate: MoreThanOrEqual(today),
      },
      order: { startDate: "DESC" },
    });
  }

  // PUBLIC: получить прошедшие конкурсы
  async findPastPublished() {
    const today = new Date().toISOString().slice(0, 10);

    return this.repo.find({
      where: {
        endDate: LessThan(today),
      },
      order: { startDate: "DESC" },
    });
  }

  // ADMIN: создать новый конкурс
  async create(dto: CreateContestDto) {
    const contest = this.repo.create(dto);
    return this.repo.save(contest);
  }

  // ADMIN: обновить данные конкурса
  async update(id: number, dto: UpdateContestDto) {
    const contest = await this.repo.findOne({ where: { id } });

    if (!contest) {
      throw new NotFoundException("Contest not found");
    }

    Object.assign(contest, dto);
    return this.repo.save(contest);
  }

  // ADMIN: удалить конкурс
  async remove(id: number) {
    const contest = await this.repo.findOne({ where: { id } });

    if (!contest) {
      throw new NotFoundException("Contest not found");
    }

    await this.repo.remove(contest);
    return { success: true };
  }
}
