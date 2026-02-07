import "dotenv/config";
import { DataSource } from "typeorm";
import path from "path";
import { writeFileSync } from "fs";

const schemaName =
  process.env.SCHEMA_GEN_NAME ||
  `_schema_gen_${new Date().getTime().toString(36)}`;

const dataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRESQL_HOST,
  port: Number(process.env.POSTGRESQL_PORT),
  username: process.env.POSTGRESQL_USER,
  password: process.env.POSTGRESQL_PASSWORD,
  database: process.env.POSTGRESQL_DBNAME,
  entities: [path.join(__dirname, "..", "entities", "**", "*.entity{.ts,.js}")],
  schema: schemaName,
  synchronize: false,
  logging: false,
});

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function run() {
  await dataSource.initialize();
  const sqlInMemory = await dataSource.driver.createSchemaBuilder().log();
  const schemaPrefix = new RegExp(`"${escapeRegExp(schemaName)}"\\.`, "g");
  const rawQueries = sqlInMemory.upQueries
    .map((q) => q.query)
    .filter((q) => !/\bDROP\b/i.test(q))
    .map((q) => q.replace(schemaPrefix, ""));

  const header = 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n';
  const sql = header + rawQueries.join(";\n") + ";\n";

  writeFileSync("schema.sql", sql, "utf8");
  await dataSource.destroy();

  console.log("schema.sql generated");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
