import { PartialType } from '@nestjs/swagger'
import { CreateAdminAdDto } from './create-admin-ad.dto'

export class UpdateAdminAdDto extends PartialType(CreateAdminAdDto) {}
