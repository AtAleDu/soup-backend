import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Ad } from "./Ad/ad.entity";
import { Article } from "./Article/article.entity";
import { Company } from "./Company/company.entity";
import { Contest } from "./Contest/contest.entity";
import { CatalogFilter } from "./Catalog/catalogFilters/catalog-filter.entity";
import { SearchIndex } from "./Search/search-index.entity";
import { Tariff } from "./Tarif/tariff.entity";
import { NewsEntity } from "./News/news.entity";
import { User } from "./User/user.entity";
import { ContractorTypeEntity } from './Contractor/contractor.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ad,
      Article,
      Company,
      Contest,
      CatalogFilter,
      SearchIndex,
      Tariff,
      NewsEntity,
      User,
      ContractorTypeEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class EntitiesModule {}
