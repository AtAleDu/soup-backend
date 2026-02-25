import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContestsController } from "./contests.controller";
import { AdminContestsController } from "./admin/admin-contests.controller";
import { ContestsService } from "./contests.service";
import { Contest } from "@entities/Contest/contest.entity";
import { StorageModule } from "@infrastructure/storage/storage.module";

@Module({
  imports: [TypeOrmModule.forFeature([Contest]), StorageModule],
  controllers: [ContestsController, AdminContestsController],
  providers: [ContestsService],
  exports: [ContestsService],
})
export class ContestsModule {}