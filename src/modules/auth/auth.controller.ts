import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import type { Request, Response } from "express";

import { AuthService } from "./auth.service";
import { TokenService } from "./token/token.service";
import { JwtAuthGuard } from "./jwt/jwt-auth.guard";

import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { VerifyDto } from "./dto/verify.dto";
import { ResendDto } from "./dto/resend.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { UpdateVerificationEmailDto } from "./dto/update-verification-email.dto";
import { MeResponseDto } from "./dto/me-response.dto";
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  // Регистрация нового пользователя
  @ApiOperation({ summary: "Регистрация пользователя" })
  @ApiResponse({ status: 201, description: "Пользователь зарегистрирован" })
  @ApiResponse({ status: 400, description: "Ошибка валидации" })
  @Post("register")
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  // Логин пользователя, выдаёт access token и кладёт refresh token в cookie
  @ApiOperation({ summary: "Логин пользователя" })
  @ApiResponse({
    status: 200,
    description: "Access token выдан, refresh token установлен в cookie",
  })
  @ApiResponse({ status: 401, description: "Неверные учетные данные" })
  @Post("login")
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(body);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      path: "/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  // Обновление access token по refresh token (через cookie)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Обновить access token по refresh token" })
  @ApiResponse({ status: 200, description: "Access token обновлён" })
  @ApiResponse({
    status: 401,
    description: "Refresh token отсутствует или недействителен",
  })
  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const payload = this.tokenService.verifyRefresh(refreshToken);

    const { accessToken, refreshToken: newRefresh } =
      await this.authService.refresh(String(payload.sub), refreshToken);

    res.cookie("refreshToken", newRefresh, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      path: "/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  // Подтверждение регистрации по коду
  @ApiOperation({ summary: "Подтверждение регистрации по коду" })
  @ApiResponse({ status: 200, description: "Пользователь подтверждён" })
  @ApiResponse({ status: 400, description: "Неверный код подтверждения" })
  @Post("verify")
  async verify(
    @Body() body: VerifyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { success, tokens } = await this.authService.verify(
      body.verificationId,
      body.code,
    );

    // Устанавливаем refresh token так же, как при логине / reset-password
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      path: "/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Для фронта сохраняем прежний контракт
    return { success };
  }

  // Повторная отправка кода подтверждения
  @ApiOperation({ summary: "Повторная отправка кода подтверждения" })
  @ApiResponse({ status: 200, description: "Код отправлен повторно" })
  @Post("resend")
  resend(@Body() body: ResendDto) {
    return this.authService.resend(body.verificationId);
  }

  // Изменение email в процессе верификации
  @ApiOperation({ summary: "Изменить email в сессии верификации" })
  @ApiResponse({ status: 200, description: "Email обновлен, новый код отправлен" })
  @ApiResponse({ status: 400, description: "Ошибка валидации или email занят" })
  @Post("update-verification-email")
  updateVerificationEmail(@Body() body: UpdateVerificationEmailDto) {
    return this.authService.updateVerificationEmail(
      body.verificationId,
      body.newEmail,
    );
  }

  // Запрос на восстановление пароля
  @ApiOperation({ summary: "Запрос на восстановление пароля" })
  @ApiResponse({ status: 200, description: "Ссылка отправлена" })
  @Post("forgot-password")
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(body.email);
  }

  // Сброс пароля по токену c автоматическим входом пользователя
  @ApiOperation({ summary: "Сброс пароля по токену" })
  @ApiResponse({ status: 200, description: "Пароль обновлён, пользователь залогинен" })
  @ApiResponse({ status: 400, description: "Ошибка валидации или токен" })
  @Post("reset-password")
  async resetPassword(
    @Body() body: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { success, tokens } = await this.authService.resetPassword(
      body.token,
      body.password,
      body.passwordConfirm,
    );

    // Устанавливаем refresh token так же, как при логине / обновлении
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      path: "/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Для фронта оставляем прежний контракт
    return { success };
  }

  // Получение данных текущего авторизованного пользователя
  @ApiBearerAuth()
  @ApiOperation({ summary: "Получить данные текущего пользователя" })
  @ApiResponse({
    status: 200,
    description: "Данные пользователя",
    type: MeResponseDto,
  })
  @ApiResponse({ status: 401, description: "Не авторизован" })
  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req: Request): MeResponseDto {
    return req.user as MeResponseDto;
  }

  // Выход пользователя из системы (инвалидация refresh token)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Выход из системы" })
  @ApiResponse({ status: 200, description: "Пользователь разлогинен" })
  @UseGuards(JwtAuthGuard)
  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as { sub: string };

    await this.authService.logout(user.sub);

    res.clearCookie("refreshToken", {
      path: "/auth/refresh",
    });

    return { success: true };
  }
}