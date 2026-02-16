import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Blog } from "@entities/Blog/blog.entity";
import { BlogLike } from "@entities/BlogLike/blog-like.entity";
import { BlogsController } from "./blogs.controller";
import { BlogsService } from "./blogs.service";
import { AdminBlogsController } from "./admin/admin-blogs.controller";
import { AuthModule } from "@modules/auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog, BlogLike]),
    AuthModule,
  ],
  controllers: [BlogsController, AdminBlogsController],
  providers: [BlogsService],
  exports: [BlogsService],
})
export class BlogsModule {}