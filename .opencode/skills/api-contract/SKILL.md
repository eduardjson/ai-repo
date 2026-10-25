---
name: API Contract
description: How the OpenAPI contract and generated API client (types, hooks) work in this project. Use when adding or changing backend endpoints/DTOs, or when the frontend needs API types or hooks.
---

# API Contract — кодогенерация

Единый источник правды API — `openapi.json` (генерируется из бэкенда).

## Поток

1. Бэкенд описывает контракт через DTO и декораторы `@nestjs/swagger`:
   - request-DTO — `server/src/<module>/dto/*.dto.ts`;
   - response-DTO (схемы) — `server/src/dto/*.response.ts`;
   - контроллеры аннотированы `@ApiTags`, `@ApiOkResponse`/`@ApiCreatedResponse`, `@ApiBearerAuth`.
2. `cd server && npm run generate:openapi` → `openapi.json` (в корне репозитория).
3. `cd client && npm run generate:api` → `client/src/api/generated.ts`
   (api + хуки `use*Query`/`use*Mutation` + типы `UserDto`, `ProductDto`, …).

## Правила

- **Никогда не правь `client/src/api/generated.ts` руками** — он генерируется.
- Не дублируй типы вручную — импортируй из `../api/generated`.
- Новый эндпоинт: добавь метод контроллера с DTO и Swagger-аннотациями → перегенерируй
  спек и клиент → используй сгенерированный хук на фронте.
- Изменил DTO на бэке → перегенерируй и поправь фронт по ошибкам TypeScript.
- Response-DTO для списков/деталей называй в OpenAPI осмысленно (`ProductListResponseDto`);
  для `Partial<...>` в контроллерах используй именованные update-DTO через `PartialType`
  (иначе кодген не сгенерирует тело запроса).
- Multipart/файлы не покрыты кодгеном — используй `uploadFormData` из `client/src/api/upload.ts`.
- Инвалидация кэша RTK Query — через `tagTypes` и `endpointOverrides` в `client/openapi-config.cjs`.
- CI проверяет дрейф (`.github/workflows/codegen-check.yml`) — всегда коммить оба артефакта
  (`openapi.json` и `client/src/api/generated.ts`).
