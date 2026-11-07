# Конструктор (house-constructor)

Отдельное фронтенд-приложение «Конструктор» — микрофронтенд, который
отображается во вкладке «Конструктор» основного приложения (`client/`) через
**Module Federation** (`@module-federation/vite`).

Содержит 3D-модель модуля (Three.js), 2D-чертёж, расчёт сметы, экспорт
CSV/PDF и сохранение проектов.

## Запуск standalone (для разработки)

```bash
npm install
npm run dev          # http://localhost:5174
```

В standalone-режиме нет хоста, который передал бы токен доступа, поэтому
серверные данные (список проектов и прайс-лист) не загружаются — 3D-вид,
чертёж и смета работают локально.

## Интеграция с хостом

Приложение собирается как remote Module Federation и отдаёт модуль `Builder`
(`remoteEntry.js`, expose `./Builder`):

- имя remote: `houseConstructor`
- порт dev-сервера: `5174`
- хост указывает remote через `VITE_CONSTRUCTOR_REMOTE` (по умолчанию
  `http://localhost:5174/remoteEntry.js`)

Хост (`client`) подгружает модуль лениво:

```tsx
const Builder = lazy(() => import('houseConstructor/Builder'))
```

React и ReactDOM шарится между хостом и remote (singleton), остальные
зависимости (MUI, three.js, jspdf) бандлятся локально в remote — поэтому
remote самодостаточен и имеет собственную тему.

## Как remote получает данные

Хост передаёт компоненту пропсы:

| Проп            | Назначение |
|-----------------|------------|
| `apiBaseUrl`    | Базовый URL API (по умолчанию `/api`) |
| `getAccessToken`| Функция, возвращающая текущий access-токен |
| `setAccessToken`| Функция записи нового токена (после refresh) |
| `themeMode`     | `'light'` / `'dark'` — режим темы |

Авторизация остаётся в хосте: remote при 401 сам вызывает
`/auth/refresh-tokens` (refresh-токен в httpOnly-cookie) и записывает новый
access-токен обратно в хост через `setAccessToken`.
