import { PartialType } from '@nestjs/swagger'
import { CreateContractorTypeDto } from './create-contractor.dto'

export class UpdateContractorTypeDto extends PartialType(CreateContractorTypeDto) {}
