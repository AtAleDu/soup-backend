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
import { VerificationService } from './verification/verification.service'
import { JwtAuthGuard } from './jwt/jwt-auth.guard'

import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { VerifyDto } from './dto/verify.dto'
import { ResendDto } from './dto/resend.dto'
import { MeResponseDto } from './dto/me-response.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly verificationService: VerificationService,
  ) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body)
  }

  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(body)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return { accessToken }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken
    if (!refreshToken) {
      throw new UnauthorizedException()
    }

    const user = req.user as { sub: string }

    const { accessToken, refreshToken: newRefresh } =
      await this.authService.refresh(
        user.sub,
        refreshToken,
      )

    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return { accessToken }
  }

  @Post('verify')
  verify(@Body() body: VerifyDto) {
    return this.verificationService.verify(
      body.verificationId,
      body.code,
    )
  }

  @Post('resend')
  resend(@Body() body: ResendDto) {
    return this.verificationService.resend(
      body.verificationId,
    )
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request): MeResponseDto {
    return req.user as MeResponseDto
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

    res.clearCookie('refreshToken', {
      path: '/auth/refresh',
    })

    return { success: true }
  }
}
