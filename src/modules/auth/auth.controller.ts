import { Controller, Post, Body, Get, Req, UseGuards, } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, } from '@nestjs/swagger'
import type { Request } from 'express'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt/jwt-auth.guard'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { AuthResponseDto } from './dto/auth-response.dto'
import { MeResponseDto } from './dto/me-response.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Пользователь уже существует',
  })
  @Post('register')
  register(
    @Body() body: RegisterDto,
  ): Promise<AuthResponseDto> {
    return this.authService.register(body)
  }

  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Неверный email или пароль',
  })
  @Post('login')
  login(
    @Body() body: LoginDto,
  ): Promise<AuthResponseDto> {
    return this.authService.login(body)
  }

  @ApiOperation({ summary: 'Получить текущего пользователя' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Данные текущего пользователя',
    type: MeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request): MeResponseDto {
    return req.user as MeResponseDto
  }
}
