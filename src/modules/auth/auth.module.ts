import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtAuthModule } from './jwt/jwt.module'
import { User } from '@entities/User/user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtAuthModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }
