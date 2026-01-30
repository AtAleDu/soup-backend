import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { EntitiesModule } from "./entities/entities.module";
import { NewsModule } from "./modules/news/news.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ContestsModule } from "@modules/contests/contests.module";
import { CatalogFiltersModule } from "./modules/catalog-filters/catalog-filters.module";
import { RevalidationModule } from "@infrastructure/revalidation/revalidation.module";
import { ContractorModule } from './modules/contractor/contractor.module'
import { RegionsModule } from "./modules/regions/regions.module";
import { CompanyAccountModule } from './modules/profile/company-account/company-account.module'
import { CompaniesModule } from "./modules/companies/companies.module";
import { BlogsModule } from "./modules/blogs/blogs.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.POSTGRESQL_HOST,
      port: Number(process.env.POSTGRESQL_PORT),
      username: process.env.POSTGRESQL_USER,
      password: process.env.POSTGRESQL_PASSWORD,
      database: process.env.POSTGRESQL_DBNAME,

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
    RevalidationModule,
    ContractorModule,
    RegionsModule,
    CompanyAccountModule,
    CompaniesModule,
    BlogsModule,
  ],
})
export class AppModule {}
