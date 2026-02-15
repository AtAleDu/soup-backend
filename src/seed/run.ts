import "dotenv/config";
import { DataSource } from "typeorm";
import { NewsEntity } from "../entities/News/news.entity";
import { Contest } from "../entities/Contest/contest.entity";
import { CatalogFilter } from "../entities/Catalog/catalogFilters/catalog-filter.entity";
import { ContractorTypeEntity } from "../entities/Contractor/contractor.entity";
import { Blog } from "../entities/Blog/blog.entity";
import { Company } from "../entities/Company/company.entity";
import { User } from "../entities/User/user.entity";
import { Client } from "../entities/Client/client.entity";
import { Order } from "../entities/Order/order.entity";
import { Tariff } from "../entities/Tarif/tariff.entity";
import { Article } from "../entities/Article/article.entity";
import { Ad } from "../entities/Ad/ad.entity";

import { seedNews } from "./news/news.seed";
import { seedContest } from "./contests/contest.seed";
import { seedCatalogFilter } from "./catalogFilters/catalog-filter.seed";
import { seedContractor } from "./contractor/contractor.seed";
import { seedBlog } from "./blogs/blog.seed";
import { seedTariffs } from "./tariffs/tariffs.seed";
import { seedClient } from "./client/client.seed";
import { seedOrders } from "./orders/order.seed";

const dbHost = process.env.POSTGRESQL_HOST || process.env.POSTGRESQL_HOSTNAME;
const dbPort =
  Number(process.env.POSTGRESQL_PORT) ||
  Number(process.env.POSTGRESQL_PORT_NUMBER) ||
  5432;
const dbUser = process.env.POSTGRESQL_USER || process.env.POSTGRESQL_USERNAME;
const dbPassword = process.env.POSTGRESQL_PASSWORD || process.env.POSTGRESQL_PASS;
const dbName = process.env.POSTGRESQL_DBNAME || process.env.POSTGRESQL_DB;

const dataSource = new DataSource({
  type: "postgres",
  host: dbHost,
  port: dbPort,
  username: dbUser,
  password: dbPassword,
  database: dbName,

  entities: [
    NewsEntity,
    Contest,
    CatalogFilter,
    ContractorTypeEntity,
    Blog,
    Company,
    User,
    Client,
    Order,
    Tariff,
    Article,
    Ad,
  ],

  synchronize: true,
});

async function run() {
  if (!dbHost || !dbUser || !dbPassword || !dbName) {
    throw new Error(
      "Postgres env vars are missing. Set POSTGRESQL_HOST/HOSTNAME, POSTGRESQL_PORT/PORT_NUMBER, POSTGRESQL_USER/USERNAME, POSTGRESQL_PASSWORD/PASS, POSTGRESQL_DBNAME/DB."
    );
  }

  await dataSource.initialize();

  await seedNews(dataSource);
  await seedContest(dataSource);
  await seedCatalogFilter(dataSource);
  await seedContractor(dataSource);
  await seedBlog(dataSource);
  await seedTariffs(dataSource);
  await seedClient(dataSource);
  await seedOrders(dataSource);

  await dataSource.destroy();
  console.log("Seed completed");
}

run().catch((err) => {
  console.error("Seed failed", err);
  process.exit(1);
});
