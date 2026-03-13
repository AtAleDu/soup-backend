import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Company } from "@entities/Company/company.entity";
import { NewsEntity } from "@entities/News/news.entity";
import { Blog } from "@entities/Blog/blog.entity";
import { Order } from "@entities/Order/order.entity";
import { Contest } from "@entities/Contest/contest.entity";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      NewsEntity,
      Blog,
      Order,
      Contest,
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
