import 'dotenv/config'
import { DataSource } from 'typeorm'
import { NewsEntity } from '../entities/news.entity'
import { seedNews } from './news.seed'

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRESQL_HOST,
  port: Number(process.env.POSTGRESQL_PORT),
  username: process.env.POSTGRESQL_USER,
  password: process.env.POSTGRESQL_PASSWORD,
  database: process.env.POSTGRESQL_DBNAME,
  entities: [NewsEntity],
  synchronize: false,
})

async function run() {
  await dataSource.initialize()
  await seedNews(dataSource)
  await dataSource.destroy()
  console.log('Seed completed')
}

run().catch((err) => {
  console.error('Seed failed', err)
  process.exit(1)
})
