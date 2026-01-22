import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Company } from '@entities/Company/company.entity'
import { CompanyReview } from '@entities/CompanyReview/company-review.entity'

@Injectable()
export class CompanyReviewsService {
  constructor(
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(CompanyReview)
    private readonly reviews: Repository<CompanyReview>,
  ) {}

  private async getCompanyByUser(userId: string) {
    const company = await this.companies.findOne({
      where: { userId },
    })
    if (!company) throw new NotFoundException('Комания не найдена')
    return company
  }

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
}
