export const AdsInvoiceStatus = {
  MODERATION: "moderation",
  APPROVED: "approved",
  REJECTED: "rejected",
  OVERDUE: "overdue",
} as const;

export type AdsInvoiceStatusValue =
  (typeof AdsInvoiceStatus)[keyof typeof AdsInvoiceStatus];
