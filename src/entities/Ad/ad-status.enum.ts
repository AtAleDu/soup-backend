export const AdStatus = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  ACTIVE: 'active',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const

export type AdStatusValue = (typeof AdStatus)[keyof typeof AdStatus]
