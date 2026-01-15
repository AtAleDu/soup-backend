import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy";
import type { StringValue } from "ms";

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>("JWT_ACCESS_SECRET");
        return {
          secret,
          signOptions: {
            expiresIn: config.get<string>(
              "JWT_ACCESS_EXPIRES_IN",
            ) as StringValue,
          },
        };
      },
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class JwtAuthModule {}
