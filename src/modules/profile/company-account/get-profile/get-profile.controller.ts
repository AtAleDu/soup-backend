import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@modules/auth/jwt/jwt-auth.guard'
import { GetCompanyProfileService } from './get-profile.service'

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile/company')
@UseGuards(JwtAuthGuard)
export class GetCompanyProfileController {
  constructor(private readonly service: GetCompanyProfileService) {}

  @ApiOperation({ summary: 'Получить профиль компании' })
  @Get()
  get(@Req() req) {
    return this.service.getProfile(req.user.sub)
  }
}
