import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NewsController } from "./news.controller";
import { NewsService } from "./news.service";
import { NewsEntity } from "@entities/News/news.entity";
import { RevalidationModule } from "@infrastructure/revalidation/revalidation.module";
@Module({
  imports: [TypeOrmModule.forFeature([NewsEntity]), RevalidationModule],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
