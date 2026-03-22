-- Выполнить вручную, если БД уже существовала до добавления колонок/статусов.
-- TypeORM synchronize в dev может применить схему автоматически.

ALTER TABLE ads_invoices
  ADD COLUMN IF NOT EXISTS payment_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS overdue_started_at TIMESTAMPTZ;

UPDATE ads_invoices
SET status = 'awaiting_payment'
WHERE status = 'moderation';

-- Для старых счетов без payment_due_at дедлайн считается от created_at + 7 дней в коде.
