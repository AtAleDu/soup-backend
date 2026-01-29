import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Company } from "@entities/Company/company.entity";

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly repo: Repository<Company>,
  ) {}

  async findAll() {
    return this.repo.find({
      select: {
        companyId: true,
        name: true,
        description: true,
        logo_url: true,
      },
      order: {
        createdAt: "DESC",
      },
    });
  }
}
