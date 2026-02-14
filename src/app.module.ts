import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { EntitiesModule } from "./entities/entities.module";
import { NewsModule } from "./modules/news/news.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ContestsModule } from "@modules/contests/contests.module";
import { CatalogFiltersModule } from "./modules/catalog-filters/catalog-filters.module";
import { ContractorModule } from './modules/contractor/contractor.module'
import { RegionsModule } from "./modules/regions/regions.module";
import { CompanyAccountModule } from './modules/profile/company-account/company-account.module'
import { ClientAccountModule } from "./modules/profile/client-account";
import { CompaniesModule } from "./modules/companies/companies.module";
import { FavoritesModule } from "./modules/favorites/favorites.module";
import { BlogsModule } from "./modules/blogs/blogs.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.POSTGRESQL_HOST || process.env.POSTGRESQL_HOSTNAME,
      port: Number(process.env.POSTGRESQL_PORT) || Number(process.env.POSTGRESQL_PORT_NUMBER) || 5432,
      username: process.env.POSTGRESQL_USER || process.env.POSTGRESQL_USERNAME,
      password: process.env.POSTGRESQL_PASSWORD || process.env.POSTGRESQL_PASS,
      database: process.env.POSTGRESQL_DBNAME ||process.env.POSTGRESQL_DB,

      autoLoadEntities: true,

      synchronize: process.env.NODE_ENV !== "production",

      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    }),

    // DOMAINS
    EntitiesModule,
    NewsModule,
    AuthModule,
    ContestsModule,
    CatalogFiltersModule,
    ContractorModule,
    RegionsModule,
    CompanyAccountModule,
    ClientAccountModule,
    CompaniesModule,
    FavoritesModule,
    BlogsModule,
  ],
})
export class AppModule {}
