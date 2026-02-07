import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NewsController } from "./news.controller";
import { NewsService } from "./news.service";
import { NewsEntity } from "@entities/News/news.entity";
import { AdminNewsController } from "./admin/admin-news.controller";

@Module({
  imports: [TypeOrmModule.forFeature([NewsEntity])],
  controllers: [NewsController, AdminNewsController],
  providers: [NewsService],
})
export class NewsModule {}
