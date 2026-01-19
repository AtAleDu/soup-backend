import { PartialType } from '@nestjs/swagger'
import { CreateContractorTypeDto } from './create-contractor-type.dto'

export class UpdateContractorTypeDto extends PartialType(CreateContractorTypeDto) {}
