import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, MoreThanOrEqual, Repository } from "typeorm";
import { Contest } from "@entities/Contest/contest.entity";
import { CreateContestDto } from "./dto/create-contest.dto";
import { UpdateContestDto } from "./dto/update-contest.dto";

function startDateSince(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

@Injectable()
export class ContestsService {
  constructor(
    @InjectRepository(Contest)
    private readonly repo: Repository<Contest>,
  ) {}

  // PUBLIC: получить текущие конкурсы
  async findCurrentPublished(time?: string) {
    const today = new Date().toISOString().slice(0, 10);
    const qb = this.repo
      .createQueryBuilder("contest")
      .where("contest.endDate >= :today", { today })
      .orderBy("contest.startDate", "DESC");

    if (time === "week") {
      qb.andWhere("contest.startDate >= :since", { since: startDateSince(7) });
    } else if (time === "month") {
      qb.andWhere("contest.startDate >= :since", { since: startDateSince(30) });
    }

    return qb.getMany();
  }

  // PUBLIC: получить прошедшие конкурсы
  async findPastPublished(time?: string) {
    const today = new Date().toISOString().slice(0, 10);
    const qb = this.repo
      .createQueryBuilder("contest")
      .where("contest.endDate < :today", { today })
      .orderBy("contest.startDate", "DESC");

    if (time === "week") {
      qb.andWhere("contest.startDate >= :since", { since: startDateSince(7) });
    } else if (time === "month") {
      qb.andWhere("contest.startDate >= :since", { since: startDateSince(30) });
    }

    return qb.getMany();
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