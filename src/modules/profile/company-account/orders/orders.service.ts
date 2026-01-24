import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Company } from '@entities/Company/company.entity'
import { Order } from '@entities/Order/order.entity'

type GetOrdersArgs = {
  status?: string
  page?: string
}

const PAGE_SIZE = 7

@Injectable()
export class CompanyOrdersService {
  constructor(
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
  ) {}

  private async getCompanyByUser(userId: string) {
    const company = await this.companies.findOne({
      where: { userId },
    })
    if (!company) throw new NotFoundException('Комания не найдена')
    return company
  }

  async getOrders(userId: string, args: GetOrdersArgs) {
    const company = await this.getCompanyByUser(userId)
    const page = this.normalizePage(args.page)
    const pageSize = PAGE_SIZE

    const [items, total] = await this.orders.findAndCount({
      where: {
        companyId: company.companyId,
        ...(args.status ? { status: args.status } : {}),
      },
      relations: { company: true },
      order: { createdAt: 'DESC' },
      take: pageSize,
      skip: (page - 1) * pageSize,
    })

    return {
      total,
      page,
      pageSize,
      orders: items.map((order) => ({
        id: order.id,
        title: order.title,
        region: order.region,
        price: order.price,
        category: order.category,
        status: order.status,
        createdAt: order.createdAt,
        orderLogoUrl: order.orderLogoUrl,
      })),
    }
  }

  private normalizePage(value?: string) {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed < 1) return 1
    return Math.floor(parsed)
  }

}
