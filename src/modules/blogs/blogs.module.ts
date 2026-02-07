import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Blog } from "@entities/Blog/blog.entity";
import { BlogsController } from "./blogs.controller";
import { BlogsService } from "./blogs.service";
import { AdminBlogsController } from "./admin/admin-blogs.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Blog])],
  controllers: [BlogsController, AdminBlogsController],
  providers: [BlogsService],
  exports: [BlogsService],
})
export class BlogsModule {}