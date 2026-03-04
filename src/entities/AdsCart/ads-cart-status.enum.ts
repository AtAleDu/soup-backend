export const AdsCartStatus = {
  ACTIVE: 'active',
  CHECKED_OUT: 'checked_out',
  EXPIRED: 'expired',
} as const

export type AdsCartStatusValue =
  (typeof AdsCartStatus)[keyof typeof AdsCartStatus]
