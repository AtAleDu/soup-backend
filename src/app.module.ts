import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EntitiesModule } from './entities/entities.module'
import { NewsModule } from './modules/news/news.module'
import { AuthModule } from './modules/auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRESQL_HOST,
      port: Number(process.env.POSTGRESQL_PORT),
      username: process.env.POSTGRESQL_USER,
      password: process.env.POSTGRESQL_PASSWORD,
      database: process.env.POSTGRESQL_DBNAME,

      autoLoadEntities: true,

      synchronize: process.env.NODE_ENV !== 'production',

      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    }),

    // DOMAINS
    EntitiesModule,
    NewsModule,
    AuthModule,
  ],
})
export class AppModule {}
