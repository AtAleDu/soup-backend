export const AdsCartItemType = {
  POSITION: 'position',
  TARIFF: 'tariff',
} as const

export type AdsCartItemTypeValue =
  (typeof AdsCartItemType)[keyof typeof AdsCartItemType]
