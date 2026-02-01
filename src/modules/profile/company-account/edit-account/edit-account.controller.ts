import { Body, Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@modules/auth/jwt/jwt-auth.guard'
import { UpdateCompanyAccountDto } from '../dto/update-company-account.dto'
import { EditCompanyAccountService } from './edit-account.service'
import { OptionalFileInterceptor } from './optional-file.interceptor'
import { memoryStorage } from 'multer'

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile/company')
@UseGuards(JwtAuthGuard)
export class EditCompanyAccountController {
  constructor(private readonly service: EditCompanyAccountService) {}

  @ApiOperation({ summary: 'Обновить профиль компании' })
  @Post()
  @UseInterceptors(
    OptionalFileInterceptor('logo', {
      storage: memoryStorage(),
    }),
  )
  async update(
    @Req() req,
    @Body() dto: UpdateCompanyAccountDto,
    @UploadedFile() logo,
  ) {
    if (logo) {
      const url = await this.service.uploadCompanyLogo(req.user.sub, logo)
      dto.profile = { ...dto.profile, logo: url }
    }
    return this.service.updateProfile(req.user.sub, dto)
  }
}
