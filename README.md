# СтройМат — система учёта строительных материалов

Fullstack-приложение для учёта стройматериалов, складов, строительных объектов
и отгрузок. Фронтенд на React, бэкенд на NestJS, БД — PostgreSQL.

## Возможности

- **Товары** — карточки с категориями, производителями, изображениями, поиском и пагинацией.
- **Склады** — остатки по складам, цены (закупка / сметная / продажа / скидка), прайс-лист.
- **Объекты** — строительные площадки с геометками на карте (Leaflet) и IP-камерами (HLS / MJPEG / snapshot).
- **Отгрузки** — перемещение товаров со склада на объект, статусы, возврат остатков при отмене.
- **Перемещения** — внутренний трансфер товаров между складами.
- **Конструктор** — интерактивное 3D-моделирование дома (фундамент → стены → стропильная система → кровля; React Three Fiber) — отдельное приложение (микрофронтенд).
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
| Конструктор (remote) | 5174 | http://localhost:5174 |
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
├── apps/house-constructor/       # отдельное приложение «Конструктор» (микрофронтенд, Module Federation)
├── server/                       # NestJS + Prisma
│   ├── src/                      # модули: auth, user, product, warehouse,
│   │                             #   object, shipment, transfer, project, chat
│   ├── src/dto/*.response.ts     # response-DTO (схемы OpenAPI)
│   └── prisma/schema.prisma
└── docs/DESIGN_SYSTEM.md         # дизайн-система
```

## Микрофронтенды (Конструктор)

Вкладка «Конструктор» — это **отдельное приложение** в `apps/house-constructor`
(исходный проект HOUSE_BUILDER), подключаемое через **Module Federation**
(`@module-federation/vite`):

```
client (host)                              apps/house-constructor (remote)
React 19 + Vite 6 + MUI                    React 19.3 + Vite 8 + HeroUI/Tailwind/R3F
  └─ import('houseConstructor/mount')         └─ federation({
       .then(m => m.mount(container))           name: 'houseConstructor',
                                                 exposes: { './mount': ... } })
```

- **Remote самодостаточен**: свой стек (React 19.3, Vite 8, TypeScript 7,
  React Three Fiber + drei, HeroUI, Tailwind 4, Redux Toolkit), свои зависимости,
  свой `package.json`/lockfile. С хостом **ничего не шарится** (в т.ч. React).
- **Интеграция — через `mount()`/`unmount()`** (паттерн single-spa): хост рендерит
  контейнер `<div>`, remote создаёт в нём собственный React-root. Хост лишь грузит
  `remoteEntry.js` по URL в рантайме.
- Бандл remote (R3F, HeroUI, Tailwind) тянется только при открытии вкладки.

### Отдельная команда и отдельный репозиторий

Конструктор поддерживается отдельной командой, поэтому он оформлен как полностью
изолированный пакет. В продакшене его выносят в **отдельный репозиторий** и
деплоят независимо, а хост ссылается на него по URL:

- локально: `VITE_CONSTRUCTOR_REMOTE=http://localhost:5174/remoteEntry.js`
- продакшен: `VITE_CONSTRUCTOR_REMOTE=https://constructor.example.com/remoteEntry.js`

Вынос в отдельный репозиторий — механический: `apps/house-constructor` уже
самодостаточен (свои `package.json`, `tsconfig`, `vite.config`, `.gitignore`).
Достаточно перенести папку в отдельный репозиторий (или `git subtree split`),
не меняя код. Хост при этом менять не нужно — только URL remote.

### Локальная разработка

```bash
# remote (терминал 1)
cd apps/house-constructor
npm install
npm run dev        # http://localhost:5174

# host (терминал 2)
cd client
npm run dev        # http://localhost:5173
```

Хост подхватывает remote по `VITE_CONSTRUCTOR_REMOTE`
(по умолчанию `http://localhost:5174/remoteEntry.js`).

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

# Корень репозитория: зависимости для git-хуков (husky + lint-staged)
npm install

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
