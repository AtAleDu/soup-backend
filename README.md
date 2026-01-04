Благоустроители BACKEND на Nest

Гайд по локальному запуску

Быстрый старт (локально)
1) npm install

2) Ставите зависимости:
Создайте файл `.env` в `soup-backend` и добавьте:

`POSTGRESQL_HOST=localhost`

`POSTGRESQL_PORT=5432`

`POSTGRESQL_USER=postgres`

`POSTGRESQL_PASSWORD=postgres`

`POSTGRESQL_DBNAME=soup`

`JWT_SECRET=soup`

`JWT_ACCESS_SECRET=soup`

3) npm start

4) Для получения документации по API используйте /api
