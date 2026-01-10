import 'dotenv/config';
import { DataSource } from 'typeorm';
import { NewsEntity } from '../entities/News/news.entity';
import { Contest } from '../entities/Contest/contest.entity';
import { seedNews } from './news/news.seed';
import { seedContest } from './contests/contest.seed';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRESQL_HOST,
  port: Number(process.env.POSTGRESQL_PORT),
  username: process.env.POSTGRESQL_USER,
  password: process.env.POSTGRESQL_PASSWORD,
  database: process.env.POSTGRESQL_DBNAME,
  entities: [NewsEntity, Contest],
  synchronize: true,
});

async function run() {
  await dataSource.initialize();
  await seedNews(dataSource);
  await seedContest(dataSource)
  await dataSource.destroy();
  console.log('Seed completed');
}

run().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});
