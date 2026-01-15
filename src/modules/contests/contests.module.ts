import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContestsController } from "./contests.controller";
import { ContestsService } from "./contests.service";
import { Contest } from "@entities/Contest/contest.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Contest])],
  controllers: [ContestsController],
  providers: [ContestsService],
  exports: [ContestsService],
})
export class ContestsModule {}
