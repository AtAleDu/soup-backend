import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsString } from 'class-validator'
import { Type } from 'class-transformer'

export class ReplyCompanyReviewDto {
  @ApiProperty({ example: 123 })
  @Type(() => Number)
  @IsInt()
  reviewId: number

  @ApiProperty({ example: 'Спасибо за отзыв!' })
  @IsString()
  @IsNotEmpty()
  replyText: string
}
