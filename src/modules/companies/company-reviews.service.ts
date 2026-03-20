import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Company } from "@entities/Company/company.entity";
import { CompanyReview } from "@entities/CompanyReview/company-review.entity";
import { CompanyReviewReply } from "@entities/CompanyReviewReply/company-review-reply.entity";
import { Client } from "@entities/Client/client.entity";
import { ClientStatus } from "@entities/Client/client-status.enum";
import { StorageService } from "@infrastructure/storage/storage.service";
import { UPLOAD_IMAGE } from "@infrastructure/upload/upload-constraints";
import { CreateCompanyReviewDto } from "./dto/create-company-review.dto";

const STORAGE_PATH_PREFIX = "personal-account/company-account/reviews";

@Injectable()
export class CompanyReviewsService {
  constructor(
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(CompanyReview)
    private readonly reviews: Repository<CompanyReview>,
    @InjectRepository(CompanyReviewReply)
    private readonly reviewReplies: Repository<CompanyReviewReply>,
    @InjectRepository(Client)
    private readonly clients: Repository<Client>,
    private readonly storage: StorageService,
  ) {}

  /** Публичный список отзывов по компании (GET /companies/:companyId/reviews) */
  async getReviewsByCompanyId(companyId: number) {
    const company = await this.companies.findOne({
      where: { companyId },
      select: { companyId: true },
    });
    if (!company) {
      throw new NotFoundException("Компания не найдена");
    }

    const reviews = await this.reviews.find({
      where: { companyId },
      relations: { author: true, reply: true },
      order: { createdAt: "DESC" },
    });

    const authorIds = [...new Set(reviews.map((r) => r.authorId))];
    const clientsByUserId = new Map<string, Client>();
    if (authorIds.length > 0) {
      const clients = await this.clients.find({
        where: { userId: In(authorIds) },
        select: { userId: true, full_name: true, avatar_url: true },
      });
      clients.forEach((c) => clientsByUserId.set(c.userId, c));
    }

    const mapped = reviews.map((review) => {
      const client = clientsByUserId.get(review.authorId);
      return {
        id: review.id,
        authorId: review.authorId,
        authorName: client?.full_name ?? review.author?.name ?? null,
        authorAvatarUrl: client?.avatar_url ?? null,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        serviceName: review.serviceName,
        imageUrls: Array.isArray(review.imageUrls) ? review.imageUrls : [],
        reply: review.reply
          ? {
              id: review.reply.id,
              authorId: review.reply.authorId,
              companyId: review.reply.companyId,
              replyText: review.reply.replyText,
              createdAt: review.reply.createdAt,
            }
          : null,
      };
    });

    return { reviews: mapped, total: mapped.length };
  }

  /** Создать отзыв (клиент со статусом active или админ) */
  async createReview(
    companyId: number,
    userId: string,
    role: string,
    dto: CreateCompanyReviewDto,
  ) {
    if (role !== "ADMIN") {
      const client = await this.clients.findOne({ where: { userId } });
      if (!client || client.status !== ClientStatus.ACTIVE) {
        throw new ForbiddenException(
          "Оставлять отзывы могут только клиенты, которые прошли модерацию",
        );
      }
    }

    const company = await this.companies.findOne({
      where: { companyId },
      select: { companyId: true },
    });
    if (!company) {
      throw new NotFoundException("Компания не найдена");
    }

    const existing = await this.reviews.findOne({
      where: { companyId, authorId: userId },
    });
    if (existing) {
      throw new BadRequestException("Вы уже оставили отзыв этой компании");
    }

    const review = this.reviews.create({
      companyId,
      authorId: userId,
      orderId: null,
      rating: dto.rating,
      comment: dto.comment.trim() || null,
      imageUrls: [],
    });
    const saved = await this.reviews.save(review);
    return this.mapReview(saved, null);
  }

  /** Загрузить фото к отзыву (клиент active или админ, только к своему отзыву) */
  async uploadReviewImage(
    companyId: number,
    reviewId: number,
    userId: string,
    role: string,
    file,
  ): Promise<{ url: string }> {
    if (role !== "ADMIN") {
      const client = await this.clients.findOne({ where: { userId } });
      if (!client || client.status !== ClientStatus.ACTIVE) {
        throw new ForbiddenException(
          "Загружать фото к отзыву могут только клиенты, которые прошли модерацию",
        );
      }
    }

    if (!file?.buffer) {
      throw new BadRequestException("Файл не передан");
    }
    if (
      !(UPLOAD_IMAGE.allowedMimeTypes as readonly string[]).includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException(
        "Недопустимый формат. Разрешены: PNG, JPEG, WebP, SVG, HEIF",
      );
    }
    if (file.size > UPLOAD_IMAGE.maxSizeBytes) {
      throw new BadRequestException("Размер файла превышает 5 МБ");
    }

    const review = await this.reviews.findOne({
      where: { id: reviewId, companyId },
    });
    if (!review) {
      throw new NotFoundException("Отзыв не найден");
    }
    if (review.authorId !== userId) {
      throw new ForbiddenException(
        "Можно добавлять фото только к своему отзыву",
      );
    }

    const pathPrefix = `${STORAGE_PATH_PREFIX}/${companyId}/${reviewId}`;
    const uploadResult = await this.storage.upload(
      {
        buffer: file.buffer,
        mimeType: file.mimetype,
        size: file.size,
        originalName: file.originalname ?? "image.jpg",
      },
      {
        allowedMimeTypes: [...UPLOAD_IMAGE.allowedMimeTypes],
        maxSizeBytes: UPLOAD_IMAGE.maxSizeBytes,
        isPublic: true,
        pathPrefix,
      },
    );

    const imageUrls = Array.isArray(review.imageUrls)
      ? [...review.imageUrls]
      : [];
    imageUrls.push(uploadResult.url);
    review.imageUrls = imageUrls;
    await this.reviews.save(review);

    return { url: uploadResult.url };
  }

  private mapReview(review: CompanyReview, reply: CompanyReviewReply | null) {
    return {
      id: review.id,
      authorId: review.authorId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      serviceName: review.serviceName,
      imageUrls: Array.isArray(review.imageUrls) ? review.imageUrls : [],
      reply: reply
        ? {
            id: reply.id,
            authorId: reply.authorId,
            companyId: reply.companyId,
            replyText: reply.replyText,
            createdAt: reply.createdAt,
          }
        : null,
    };
  }
}
