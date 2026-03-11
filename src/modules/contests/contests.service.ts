import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, MoreThanOrEqual, Repository } from "typeorm";
import { Contest } from "@entities/Contest/contest.entity";
import { CreateContestDto } from "./dto/create-contest.dto";
import { UpdateContestDto } from "./dto/update-contest.dto";
import { StorageService } from "@infrastructure/storage/storage.service";
import { UPLOAD_IMAGE } from "@infrastructure/upload/upload-constraints";

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
    private readonly storage: StorageService,
  ) {}

  async uploadContestImage(file: Express.Multer.File): Promise<{ url: string }> {
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

    const ext = file.originalname?.match(/\.[a-z]+$/i)?.[0] ?? ".jpg";
    const uploadResult = await this.storage.upload(
      {
        buffer: file.buffer,
        mimeType: file.mimetype,
        size: file.size,
        originalName: `contest-${Date.now()}${ext}`,
      },
      {
        allowedMimeTypes: [...UPLOAD_IMAGE.allowedMimeTypes],
        maxSizeBytes: UPLOAD_IMAGE.maxSizeBytes,
        isPublic: true,
        pathPrefix: "contests/admin-images",
      },
    );

    return { url: uploadResult.url };
  }

  async findAll() {
    return this.repo.find({ order: { startDate: "DESC" } });
  }

  async findOne(id: number) {
    const contest = await this.repo.findOne({ where: { id } });
    if (!contest) {
      throw new NotFoundException("Contest not found");
    }
    return contest;
  }

  async findCurrentPublished(time?: string, free?: string) {
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

    if (free === "1" || free === "true") {
      qb.andWhere(
        "(contest.participationCost IS NULL OR contest.participationCost = '' OR TRIM(LOWER(contest.participationCost)) = 'бесплатно' OR contest.participationCost = '0')",
      );
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