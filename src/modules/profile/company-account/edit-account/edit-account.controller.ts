import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@modules/auth/jwt/jwt-auth.guard'
import { UpdateCompanyAccountDto } from '../dto/update-company-account.dto'
import { EditCompanyAccountService } from './edit-account.service'

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile/company')
@UseGuards(JwtAuthGuard)
export class EditCompanyAccountController {
  constructor(private readonly service: EditCompanyAccountService) {}

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
