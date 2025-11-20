import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

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
      synchronize: false,
    }),
  ],
})
export class AppModule {}
