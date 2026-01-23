import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Company } from '@entities/Company/company.entity'
import { CompanyReview } from '@entities/CompanyReview/company-review.entity'
import { CompanyReviewReply } from '@entities/CompanyReviewReply/company-review-reply.entity'
import { ReplyCompanyReviewDto } from './dto/reply-company-review.dto'

@Injectable()
export class CompanyReviewsService {
  constructor(
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(CompanyReview)
    private readonly reviews: Repository<CompanyReview>,
    @InjectRepository(CompanyReviewReply)
    private readonly reviewReplies: Repository<CompanyReviewReply>,
  ) {}

  // Получить компанию по ID пользователя
  private async getCompanyByUser(userId: string) {
    const company = await this.companies.findOne({
      where: { userId },
    })
    if (!company) throw new NotFoundException('Комания не найдена')
    return company
  }

  // Получить отзывы компании
  async getReviews(userId: string) {
    const company = await this.getCompanyByUser(userId)
    const reviews = await this.reviews.find({
      where: { companyId: company.companyId },
      relations: { author: true, reply: true },
      order: { createdAt: 'DESC' },
    })

    const mapped = reviews.map((review) => ({
      id: review.id,
      orderId: review.orderId,
      companyId: review.companyId,
      authorId: review.authorId,
      authorName: review.author?.name ?? null,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      serviceId: review.serviceId,
      serviceName: review.serviceName,
      reply: review.reply
        ? {
            id: review.reply.id,
            authorId: review.reply.authorId,
            companyId: review.reply.companyId,
            replyText: review.reply.replyText,
            createdAt: review.reply.createdAt,
          }
        : null,
    }))

    return {
      total: mapped.length,
      reviews: mapped,
    }
  }

  // Ответ компании на отзыв
  async replyToReview(userId: string, dto: ReplyCompanyReviewDto) {
    const company = await this.getCompanyByUser(userId)
    const review = await this.reviews.findOne({
      where: { id: dto.reviewId, companyId: company.companyId },
      relations: { reply: true },
    })

    if (!review) throw new NotFoundException('Отзыв не найден')

    if (review.reply) {
      review.reply.replyText = dto.replyText
      const saved = await this.reviewReplies.save(review.reply)
      return {
        id: saved.id,
        reviewId: saved.reviewId,
        companyId: saved.companyId,
        authorId: saved.authorId,
        replyText: saved.replyText,
        createdAt: saved.createdAt,
      }
    }

    const reply = this.reviewReplies.create({
      reviewId: review.id,
      companyId: company.companyId,
      authorId: userId,
      replyText: dto.replyText,
    })

    const saved = await this.reviewReplies.save(reply)
    return {
      id: saved.id,
      reviewId: saved.reviewId,
      companyId: saved.companyId,
      authorId: saved.authorId,
      replyText: saved.replyText,
      createdAt: saved.createdAt,
    }
  }

  // Получить ответ компании на отзыв
  async getReply(userId: string, reviewId: number) {
    const company = await this.getCompanyByUser(userId)
    const review = await this.reviews.findOne({
      where: { id: reviewId, companyId: company.companyId },
      relations: { reply: true },
    })

    if (!review) throw new NotFoundException('Отзыв не найден')

    if (!review.reply) return null

    return {
      id: review.reply.id,
      reviewId: review.reply.reviewId,
      companyId: review.reply.companyId,
      authorId: review.reply.authorId,
      replyText: review.reply.replyText,
      createdAt: review.reply.createdAt,
    }
  }
}
