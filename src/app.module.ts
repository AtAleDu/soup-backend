import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Сущности
import { EntitiesModule } from './entities/entities.module';

// Модули
import { NewsModule } from './modules/news/news.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRESQL_HOST,
      port: parseInt(process.env.POSTGRESQL_PORT),
      username: process.env.POSTGRESQL_USER,
      password: process.env.POSTGRESQL_PASSWORD,
      database: process.env.POSTGRESQL_DBNAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    EntitiesModule,
    NewsModule,
    AuthModule,
  ],
})
export class AppModule { }
