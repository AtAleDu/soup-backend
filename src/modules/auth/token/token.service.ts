import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import type { JwtPayload } from "jsonwebtoken";
import type { StringValue } from "ms";
import { User } from "@entities/User/user.entity";

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async issue(user: User) {
    const payload = { sub: user.id, role: user.role };

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get("JWT_ACCESS_EXPIRES_IN") as StringValue,
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get("JWT_REFRESH_SECRET"),
      expiresIn: this.config.get("JWT_REFRESH_EXPIRES_IN") as StringValue,
    });

    return { accessToken, refreshToken };
  }

  verifyRefresh(token: string): JwtPayload {
    try {
      return this.jwt.verify(token, {
        secret: this.config.get("JWT_REFRESH_SECRET"),
      });
    } catch {
      throw new UnauthorizedException();
    }
  }
}
