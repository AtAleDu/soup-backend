import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt/jwt-auth.guard'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { MeResponseDto } from './dto/me-response.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: false, // ⚠️ true в PROD
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh',
    })
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie('refreshToken', {
      path: '/auth/refresh',
    })
  }

  @Post('register')
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.register(body)

    this.setRefreshCookie(res, refreshToken)

    return { accessToken }
  }

  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(body)

    this.setRefreshCookie(res, refreshToken)

    return { accessToken }
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken

    if (!refreshToken) {
      throw new UnauthorizedException()
    }

    const payload =
      this.authService.verifyRefreshToken(refreshToken)

    const user =
      await this.authService.getUserIfRefreshTokenMatches(
        payload.sub as string,
        refreshToken,
      )

    const {
      accessToken,
      refreshToken: newRefreshToken,
    } = await this.authService.issueTokens(user)

    this.setRefreshCookie(res, newRefreshToken)

    return { accessToken }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as { sub: string }

    await this.authService.logout(user.sub)

    this.clearRefreshCookie(res)

    return { success: true }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request): MeResponseDto {
    return req.user as MeResponseDto
  }
}
