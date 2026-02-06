import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import type { StringValue } from "ms";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { User } from "@entities/User/user.entity";
import { Company } from "@entities/Company/company.entity";
import { Tariff } from "@entities/Tarif/tariff.entity";
import { VerificationSession } from "@entities/VerificationSession/verification-session.entity";
import { PasswordResetToken } from "@entities/PasswordResetToken/password-reset-token.entity";

import { PasswordService } from "./password/password.service";
import { TokenService } from "./token/token.service";
import { RefreshTokenService } from "./refresh-token/refresh-token.service";
import { VerificationService } from "./verification/verification.service";

import { JwtStrategy } from "./jwt/jwt.strategy";
import { EmailModule } from "@infrastructure/email/email.module";

@Module({
  imports: [
    // config
    ConfigModule,

    // entities
    TypeOrmModule.forFeature([
      User,
      Company,
      Tariff,
      VerificationSession,
      PasswordResetToken,
    ]),

    // auth infra
    PassportModule.register({ defaultStrategy: "jwt" }),

    // jwt
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_ACCESS_SECRET")!,
        signOptions: {
          expiresIn: config.get<StringValue>("JWT_ACCESS_EXPIRES_IN"),
        },
      }),
    }),

    // email
    EmailModule,
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    PasswordService,
    TokenService,
    RefreshTokenService,
    VerificationService,
    JwtStrategy,
  ],

  exports: [AuthService],
})
export class AuthModule {}
