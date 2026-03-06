import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Company } from '@entities/Company/company.entity'
import { AdPosition } from '@entities/Ad/ad-position.entity'
import { Ad } from '@entities/Ad/ad.entity'
import { Tariff } from '@entities/Tarif/tariff.entity'
import { AdsCart } from '@entities/AdsCart/ads-cart.entity'
import { AdsCartItem } from '@entities/AdsCartItem/ads-cart-item.entity'
import { CompanyAdsCartController } from './cart.controller'
import { CompanyAdsCartService } from './cart.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      AdPosition,
      Ad,
      Tariff,
      AdsCart,
      AdsCartItem,
    ]),
  ],
  controllers: [CompanyAdsCartController],
  providers: [CompanyAdsCartService],
})
export class AdsCartModule {}
