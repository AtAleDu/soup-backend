/** Дней на оплату/отметку «Оплачено» с момента выставления счёта */
export const COMPANY_INVOICE_PAYMENT_DEADLINE_DAYS = 7;

/** Сколько часов показывать счёт компании после перехода в overdue, затем expired */
export const COMPANY_INVOICE_OVERDUE_GRACE_HOURS = 24;

/** @deprecated используйте COMPANY_INVOICE_PAYMENT_DEADLINE_DAYS */
export const INVOICE_PAYMENT_DEADLINE_DAYS = COMPANY_INVOICE_PAYMENT_DEADLINE_DAYS;

export const INVOICE_RECIPIENT = {
  name: 'ИП Зонов Дмитрий Александрович',
  inn: '1234567890',
  kpp: '123456789',
  accountNumber: '40702810100001234567',
  bankName: 'АО «Пример Банк»',
  bankAddress: '123456, г. Москва, ул. Примерная, д. 1',
  bik: '044525225',
  correspondentAccount: '30101810245250000225',
  legalAddress: '123456, г. Москва, ул. Примерная, д. 1',
  phone: '+7 (495) 123-45-67',
} as const;
