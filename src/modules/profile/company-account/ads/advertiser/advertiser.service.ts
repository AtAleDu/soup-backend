import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '@entities/Company/company.entity';
import { CompanyAdsAdvertiser } from '@entities/CompanyAdsAdvertiser/company-ads-advertiser.entity';
import type { SaveAdvertiserDto } from './dto/save-advertiser.dto';

@Injectable()
export class CompanyAdsAdvertiserService {
  constructor(
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(CompanyAdsAdvertiser)
    private readonly advertisers: Repository<CompanyAdsAdvertiser>,
  ) {}

  private async getCompanyByUserId(userId: string): Promise<Company> {
    const company = await this.companies.findOne({ where: { userId } });
    if (!company) {
      throw new NotFoundException('Компания не найдена');
    }
    return company;
  }

  async getAdvertiser(userId: string): Promise<CompanyAdsAdvertiser | null> {
    const company = await this.getCompanyByUserId(userId);
    return this.advertisers.findOne({ where: { companyId: company.companyId } });
  }

  async saveAdvertiser(userId: string, dto: SaveAdvertiserDto): Promise<CompanyAdsAdvertiser> {
    const company = await this.getCompanyByUserId(userId);
    const data = {
      inn: dto.inn,
      kpp: dto.kpp,
      shortName: dto.shortName,
      fullName: dto.fullName,
      phone: dto.phone ?? '',
      email: dto.email ?? '',
      postalAddress: dto.postalAddress ?? '',
      postalCode: dto.postalCode ?? '',
      legalAddress: dto.legalAddress ?? '',
    };
    let row = await this.advertisers.findOne({ where: { companyId: company.companyId } });
    if (row) {
      row.data = data;
      return this.advertisers.save(row);
    }
    row = this.advertisers.create({ companyId: company.companyId, data });
    return this.advertisers.save(row);
  }

  async deleteAdvertiser(userId: string): Promise<void> {
    const company = await this.getCompanyByUserId(userId);
    await this.advertisers.delete({ companyId: company.companyId });
  }
}
