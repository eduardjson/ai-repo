# Vite + React + NestJS + Prisma + PostgreSQL (Docker Compose)

Простой fullstack-проект из трёх контейнеров:

| Сервис  | Технологии                        | Порт (host) |
| ------- | --------------------------------- | ----------- |
| `client`| Vite + React                      | `5173`      |
| `server`| NestJS + Prisma                   | `3000`      |
| `db`    | PostgreSQL                        | `5432`      |

## Структура

```
.
├── docker-compose.yml
├── client/          # Vite + React (фронтенд)
└── server/          # NestJS + Prisma (бэкенд)
    └── prisma/schema.prisma
```

## Запуск

```bash
docker compose up --build
```

После запуска:

- Фронтенд: http://localhost:5173
- API: http://localhost:3000/api
- Список записей: http://localhost:3000/api/items

## Проверка API

```bash
# Получить все записи
curl http://localhost:3000/api/items

# Создать запись
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Привет","description":"Моя первая запись"}'
```

## Локальная разработка (без Docker)

```bash
# БД можно поднять отдельно:
docker compose up -d db

# Бэкенд
cd server
npm install
npx prisma generate
npm run start:dev

# Фронтенд (в другом терминале)
cd client
npm install
npm run dev
```

Фронтенд проксирует `/api` на `http://localhost:3000` по умолчанию
(в Docker — на `http://server:3000` через переменную `VITE_API_TARGET`).
