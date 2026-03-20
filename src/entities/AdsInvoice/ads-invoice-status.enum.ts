export const AdsInvoiceStatus = {
  MODERATION: "moderation",
  PAID: "paid",
  REJECTED: "rejected",
  OVERDUE: "overdue",
} as const;

export type AdsInvoiceStatusValue =
  (typeof AdsInvoiceStatus)[keyof typeof AdsInvoiceStatus];
