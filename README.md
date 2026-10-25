# СтройМат — система учёта строительных материалов

Fullstack-приложение для учёта стройматериалов, складов, строительных объектов
и отгрузок. Фронтенд на React, бэкенд на NestJS, БД — PostgreSQL.

## Возможности

- **Товары** — карточки с категориями, производителями, изображениями, поиском и пагинацией.
- **Склады** — остатки по складам, цены (закупка / сметная / продажа / скидка), прайс-лист.
- **Объекты** — строительные площадки с геометками на карте (Leaflet) и IP-камерами (HLS / MJPEG / snapshot).
- **Отгрузки** — перемещение товаров со склада на объект, статусы, возврат остатков при отмене.
- **Перемещения** — внутренний трансфер товаров между складами.
- **Конструктор** — 3D-модель модуля (Three.js), 2D-чертёж, расчёт сметы, экспорт CSV/PDF, сохранение проектов.
- **Чат** — реального времени (Socket.IO), редактирование/удаление последнего сообщения, PDF-вложения в БД.
- **Сотрудники** — управление пользователями (только ADMIN), роли `ADMIN` / `USER`.
- **Авторизация** — JWT: access-токен в памяти + refresh-токен в httpOnly-cookie с ротацией.

## Стек

| Слой         | Технологии |
|--------------|------------|
| Frontend     | React 19, Vite 6, TanStack Router, Redux Toolkit (RTK Query), MUI v7, react-hook-form + zod |
| Backend      | NestJS 11, Prisma 7, PostgreSQL 17 |
| Realtime     | Socket.IO |
| API-контракт | OpenAPI 3 (Swagger) + `@rtk-query/codegen-openapi` |

## Запуск (Docker)

```bash
docker compose up --build
```

После запуска:

| Сервис       | Порт | URL |
|--------------|------|-----|
| Фронтенд     | 5173 | http://localhost:5173 |
| API          | 3000 | http://localhost:3000/api |
| Swagger UI   | —    | http://localhost:3000/docs |
| Swagger JSON | —    | http://localhost:3000/docs-json |
| PostgreSQL   | 5432 | — |

Учётные данные по умолчанию: `admin@example.com` / `admin` (роль `ADMIN`).
Задаются переменными `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Структура

```
.
├── docker-compose.yml
├── openapi.json                  # API-контракт (источник правды, генерируется)
├── .github/workflows/            # CI: проверка дрейфа кодгена
├── client/                       # React + Vite + MUI
│   ├── src/api/generated.ts      # сгенерированный API + хуки + типы
│   └── ...
├── server/                       # NestJS + Prisma
│   ├── src/                      # модули: auth, user, product, warehouse,
│   │                             #   object, shipment, transfer, project, chat
│   ├── src/dto/*.response.ts     # response-DTO (схемы OpenAPI)
│   └── prisma/schema.prisma
└── docs/DESIGN_SYSTEM.md         # дизайн-система
```

## API-контракт и кодогенерация

Единый источник правды — `openapi.json`:

```
бэкенд (DTO + @nestjs/swagger)
  → cd server && npm run generate:openapi   → openapi.json
  → cd client && npm run generate:api       → client/src/api/generated.ts (api + хуки + типы)
```

- Типы (`UserDto`, `ProductDto`, …) и хуки (`use*Query` / `use*Mutation`) генерируются,
  вручную их не править.
- CI (`.github/workflows/codegen-check.yml`) перегенерирует оба артефакта и падает,
  если они разошлись с закоммиченным состоянием.

## Локальная разработка (без Docker)

```bash
# БД поднять отдельно
docker compose up -d db

# Бэкенд
cd server
cp .env.example .env   # при необходимости поправить значения
npm install
npx prisma generate
npm run start:dev

# Фронтенд (в другом терминале)
cd client
npm install
npm run dev
```

Фронтенд проксирует `/api` на `http://localhost:3000` по умолчанию
(в Docker — на `http://server:3000` через `VITE_API_TARGET`).

## Переменные окружения (server)

| Переменная     | Значение по умолчанию                              | Назначение |
|----------------|----------------------------------------------------|------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@db:5432/mydb?schema=public` | строка подключения БД |
| `PORT`         | `3000`                                             | порт сервера |
| `JWT_SECRET`   | в `.env` (см. `.env.example`)                      | секрет для JWT |
| `ADMIN_EMAIL`  | `admin@example.com`                                | email администратора (seed) |
| `ADMIN_PASSWORD` | `admin`                                          | пароль администратора (seed) |
