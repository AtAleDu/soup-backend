Благоустроители BACKEND на Nest

Гайд по локальному запуску

Быстрый старт (локально)
1) npm install

2) Ставите зависимости:
Создайте файл `.env` в `soup-backend` и добавьте:

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


3) npm start

4) Для получения документации по API используйте /api
