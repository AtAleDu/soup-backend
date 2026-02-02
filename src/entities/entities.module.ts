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
import { CompanyReview } from "./CompanyReview/company-review.entity";
import { CompanyReviewReply } from "./CompanyReviewReply/company-review-reply.entity";
import { Order } from "./Order/order.entity";
import { CompanyService } from "./CompanyService/company-service.entity";
import { Blog } from "./Blog/blog.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ad,
      Article,
      Blog,
      Company,
      Contest,
      CatalogFilter,
      SearchIndex,
      Tariff,
      NewsEntity,
      User,
      ContractorTypeEntity,
      CompanyReview,
      CompanyReviewReply,
      Order,
      CompanyService,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class EntitiesModule {}
