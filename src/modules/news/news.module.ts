import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NewsController } from "./news.controller";
import { NewsService } from "./news.service";
import { NewsEntity } from "@entities/News/news.entity";
import { AdminNewsController } from "./admin/admin-news.controller";
import { StorageModule } from "@infrastructure/storage/storage.module";

@Module({
  imports: [TypeOrmModule.forFeature([NewsEntity]), StorageModule],
  controllers: [NewsController, AdminNewsController],
  providers: [NewsService],
})
export class NewsModule {}
