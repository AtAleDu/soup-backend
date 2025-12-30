import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ad } from './ad.entity';
import { Article } from './article.entity';
import { Company } from './company.entity';
import { Contest } from './contest.entity';
import { SearchIndex } from './search-index.entity';
import { Tariff } from './tariff.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ad,
      Article,
      Company,
      Contest,
      SearchIndex,
      Tariff,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class EntitiesModule {}
