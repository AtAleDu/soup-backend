-- Миграция: отзывы без заказа + фото отзывов
-- Запустить вручную, если в production отключён TypeORM synchronize.

-- order_id: сделать nullable (отзыв можно оставить без заказа)
ALTER TABLE company_reviews
  ALTER COLUMN order_id DROP NOT NULL;

-- image_urls: массив URL фотографий отзыва
ALTER TABLE company_reviews
  ADD COLUMN IF NOT EXISTS image_urls jsonb DEFAULT '[]'::jsonb;
