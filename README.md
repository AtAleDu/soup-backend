Благоустроители BACKEND на Nest

Гайд по локальному запуску

Быстрый старт (локально)
1) npm install

2) Ставите зависимости:
Создайте файл `.env` в `soup-backend` и добавьте:

NODE_ENV='development'

// База данных

POSTGRESQL_HOST=localhost
POSTGRESQL_PORT=5432
POSTGRESQL_USER=postgres
POSTGRESQL_PASSWORD=Vova2005
POSTGRESQL_DBNAME=soup

// JWT

JWT_ACCESS_SECRET=soup
JWT_REFRESH_SECRET=soup
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d


// Frontend & Revalidation

FRONTEND_URL=http://localhost:3000
REVALIDATE_SECRET=your_secret_key

// Email (Resend)

RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=onboarding@yourdomain.com
APP_NAME=Soup

// Загрузка в s3 хранилище

S3_BUCKET=4b615622-soup
S3_REGION=ru-1
S3_ENDPOINT=https://s3.twcstorage.ru
S3_ACCESS_KEY=
S3_SECRET_KEY=

3) `npm start`

4) Для получения документации по API используйте: `http://localhost:3005/api`

5) Если все работает, то заполните бд сид-данными, которые автоматически подставят нужные данные в бд: `npm run seed`

