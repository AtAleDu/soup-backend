import "dotenv/config";
import { DataSource } from "typeorm";
import path from "path";
import { writeFileSync } from "fs";

const schemaName =
  process.env.SCHEMA_GEN_NAME ||
  `_schema_gen_${new Date().getTime().toString(36)}`;

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
  entities: [path.join(__dirname, "..", "entities", "**", "*.entity{.ts,.js}")],
  schema: schemaName,
  synchronize: false,
  logging: false,
});

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function run() {
  if (!dbHost || !dbUser || !dbPassword || !dbName) {
    throw new Error(
      "Postgres env vars are missing. Set POSTGRESQL_HOST/HOSTNAME, POSTGRESQL_PORT/PORT_NUMBER, POSTGRESQL_USER/USERNAME, POSTGRESQL_PASSWORD/PASS, POSTGRESQL_DBNAME/DB."
    );
  }

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
