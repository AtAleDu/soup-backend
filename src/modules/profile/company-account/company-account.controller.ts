import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common'
import { CompanyAccountService } from './company-account.service'
import { JwtAuthGuard } from '@modules/auth/jwt/jwt-auth.guard'
import { UpdateCompanyAccountDto } from './dto/update-company-account.dto'
import { ForbiddenException } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'


@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile/company')
@UseGuards(JwtAuthGuard)
export class CompanyAccountController {
  constructor(private readonly service: CompanyAccountService) {}

  @ApiOperation({ summary: 'Получить профиль компании' })
  @Get()
  get(@Req() req) {
    return this.service.getProfile(req.user.sub)
  }

  @ApiOperation({ summary: 'Обновить профиль компании' })
  @Post()
  update(
    @Req() req, 
    @Body() dto: UpdateCompanyAccountDto,
) {
    return this.service.updateProfile(req.user.sub, dto)
  }
}
