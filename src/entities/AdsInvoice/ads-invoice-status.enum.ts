export const AdsInvoiceStatus = {
  /** Счёт выставлен, компания ещё не нажала «Оплачено» */
  AWAITING_PAYMENT: "awaiting_payment",
  /** Компания нажала «Оплачено», ждём проверки админом */
  PAYMENT_REVIEW: "payment_review",
  PAID: "paid",
  REJECTED: "rejected",
  /** Не уложились в срок оплаты/отметки */
  OVERDUE: "overdue",
  /** Окно «просрочено» закончилось — не показываем компании */
  EXPIRED: "expired",
  /** @deprecated старые записи; трактовать как awaiting_payment */
  MODERATION: "moderation",
} as const;

export type AdsInvoiceStatusValue =
  (typeof AdsInvoiceStatus)[keyof typeof AdsInvoiceStatus];
