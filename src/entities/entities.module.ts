import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ad } from './ad.entity';
import { Article } from './article.entity';
import { Company } from './company.entity';
import { Contest } from './contest.entity';
import { SearchIndex } from './search-index.entity';
import { Tariff } from './tariff.entity';
import { NewsEntity } from './news.entity';
import { User } from './user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ad,
      Article,
      Company,
      Contest,
      SearchIndex,
      Tariff,
      NewsEntity,
      User,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class EntitiesModule {}
