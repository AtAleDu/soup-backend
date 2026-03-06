import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@modules/auth/jwt/jwt-auth.guard'
import { CompanyAdsCartService } from './cart.service'
import { AdsCartResponseDto } from './dto/ads-cart.dto'
import { AddAdsCartItemDto } from './dto/add-ads-cart-item.dto'
import { UpdateAdsCartItemDto } from './dto/update-ads-cart-item.dto'

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile/company/ads/cart')
@UseGuards(JwtAuthGuard)
export class CompanyAdsCartController {
  constructor(private readonly service: CompanyAdsCartService) {}

  @ApiOperation({ summary: 'Получить активную корзину рекламы компании' })
  @ApiResponse({ status: 200, type: AdsCartResponseDto })
  @Get()
  getCart(@Req() req) {
    return this.service.getActiveCart(req.user.sub)
  }

  @ApiOperation({ summary: 'Добавить позицию в корзину рекламы' })
  @ApiResponse({ status: 200, type: AdsCartResponseDto })
  @Post('items')
  addCartItem(@Req() req, @Body() dto: AddAdsCartItemDto) {
    return this.service.addItemToCart(req.user.sub, dto)
  }

  @ApiOperation({ summary: 'Оформить рекламную корзину' })
  @ApiResponse({ status: 200, type: AdsCartResponseDto })
  @Post('checkout')
  checkout(@Req() req) {
    return this.service.checkoutCart(req.user.sub)
  }

  @ApiOperation({ summary: 'Обновить позицию в корзине рекламы' })
  @ApiResponse({ status: 200, type: AdsCartResponseDto })
  @Patch('items/:itemId')
  updateCartItem(
    @Req() req,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateAdsCartItemDto,
  ) {
    return this.service.updateCartItem(req.user.sub, itemId, dto)
  }

  @ApiOperation({ summary: 'Удалить позицию из корзины рекламы' })
  @ApiResponse({ status: 200, type: AdsCartResponseDto })
  @Delete('items/:itemId')
  removeCartItem(
    @Req() req,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.service.removeCartItem(req.user.sub, itemId)
  }
}
