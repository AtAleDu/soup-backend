import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { NewsModule } from './news/news.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Временно  отключаем БД
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.POSTGRESQL_HOST,
    //   port: parseInt(process.env.POSTGRESQL_PORT),
    //   username: process.env.POSTGRESQL_USER,
    //   password: process.env.POSTGRESQL_PASSWORD,
    //   database: process.env.POSTGRESQL_DBNAME,
    //   autoLoadEntities: true,
    //   synchronize: false,
    // }),

    NewsModule,
  ],
})
export class AppModule {}
