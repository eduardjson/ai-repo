# Авторизация в «СтройМат»

Классическая схема с **двумя токенами**: короткоживущий JWT (access) и
долгоживущий opaque refresh-токен с ротацией.

## 1. Общая идея

При логине сервер выдаёт **два токена**:

- **access-token** — JWT, живёт 15 минут, подписан секретом, содержит `sub`
  (id пользователя), `email`, `role`. Фронт держит его **в памяти** и шлёт в
  заголовке `Authorization: Bearer …`.
- **refresh-token** — случайный UUID, живёт 30 дней, хранится в БД
  (таблица `Token`). Сервер кладёт его в **httpOnly-cookie**, которую браузер
  автоматически присылает обратно.

Access нужен для каждого запроса; когда он истекает (401), фронт «тихо»
обменивает refresh-токен на новую пару и повторяет исходный запрос.
Refresh-токен одноразовый (ротация).

## 2. Модели данных (Prisma)

```prisma
enum Role { ADMIN USER }

model User {
  id        String  @id @default(uuid())
  email     String  @unique
  password  String          // bcrypt-хеш
  role      Role[]  @default([USER])
  // ... username, firstName, lastName, phone, avatar, timestamps
  tokens    Token[]
}

model Token {
  id      String   @id @default(uuid())
  token   String   @unique     // сам refresh-токен (uuid v4)
  expires DateTime
  userId  String
  user    User     @relation(..., onDelete: Cascade)
}
```

Пароль хранится только в виде **bcrypt-хеша (10 раундов)** — при создании
пользователя в `user.service.ts`: `bcrypt.hash(password, 10)`.

## 3. Бэкенд

### 3.1. Константы (`auth.service.ts`)

```ts
const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 дней
```

### 3.2. Логин — `POST /api/auth/login` (помечен `@Public`)

1. `LoginDto` валидируется через `class-validator` (`@IsEmail`, `@IsString`).
2. `authService.login`:
   - ищет пользователя по email;
   - `bcrypt.compare(password, user.password)` — при несовпадении
     `UnauthorizedException('Invalid credentials')`;
   - вызывает `generateTokens(user.id, user.email, user.role)`.
3. `generateTokens`:
   - **access** = `jwtService.sign({ sub, email, role }, { expiresIn: '15m' })`;
   - **refresh** = `uuidv4()`, сохраняется в таблицу `Token` с
     `expires = now + 30 дней`.
4. Контроллер кладёт refresh в cookie (см. 3.6) и возвращает
   `{ accessToken, user }` (пароль вырезается из `user`).

### 3.3. Как подписан JWT (`auth.module.ts`, `jwt.strategy.ts`)

```ts
JwtModule.registerAsync({
  secret: config.get('JWT_SECRET', 'super-secret-jwt-key'),
  signOptions: { expiresIn: '15m' },
})
```

Секрет берётся из `JWT_SECRET` (`.env`), дефолт — `'super-secret-jwt-key'`.
Стратегия `passport-jwt` читает токен из `Authorization: Bearer …`
(`ExtractJwt.fromAuthHeaderAsBearerToken()`), проверяет подпись и срок, затем
`validate()` **подгружает пользователя из БД по `payload.sub`** и возвращает его
без пароля. Даже если JWT валиден, но пользователь удалён — будет 401.

### 3.4. Глобальные guard'ы (подключены в `app.module.ts` через `APP_GUARD`)

```ts
{ provide: APP_GUARD, useClass: JWTAuthGuard },  // сначала
{ provide: APP_GUARD, useClass: RolesGuard },     // затем
```

- **`JWTAuthGuard`** — расширяет `AuthGuard('jwt')`. Если на обработчике/классе
  есть `@Public()` (метка `IS_PUBLIC_KEY`), пропускает без проверки; иначе
  требует валидный access-token. То есть **все роуты защищены по умолчанию**,
  открыты только `@Public` (login, refresh-tokens, отдача картинки товара).
- **`RolesGuard`** — если `@Public()` → пропустить; если `@Roles(...)` задан →
  проверить пересечение с `user.role`; если `@Roles` нет → пропустить
  (достаточно просто быть аутентифицированным).

Пример: `@Roles('ADMIN')` на `POST /user`, `GET /user/all-users`,
`PATCH /user/:id`, `DELETE /user/:id` — доступны только админам;
`GET /user/me` — любому аутентифицированному.

### 3.5. Обновление пары — `POST /api/auth/refresh-tokens` (помечен `@Public`)

Refresh-токен приходит в cookie, а не в теле. Логика в
`authService.refreshTokens`, **внутри транзакции**:

1. ищет запись `Token` по значению refresh-токена;
2. если записи нет или `expires < now` — удаляет запись и бросает 401;
3. находит пользователя;
4. **удаляет старый refresh-токен**;
5. выпускает новый access (JWT) и новый refresh (uuid), сохраняет новый в `Token`;
6. возвращает `{ accessToken, refreshToken, user }`, контроллер снова кладёт
   refresh в cookie.

Это и есть **ротация**: использованный refresh-токен немедленно становится
недействительным, поэтому переиспользование старого (потенциально украденного)
токена не сработает.

### 3.6. Cookie refresh-токена (`getRefreshTokenCookieOptions`)

```ts
{
  httpOnly: true,                              // JS не может прочитать
  secure: process.env.NODE_ENV === 'production', // по HTTPS в проде
  sameSite: 'lax',
  path: '/api/auth',                           // шлётся только на /api/auth/*
  maxAge: 30 дней,
}
```

`path: '/api/auth'` означает: cookie уходит только на эндпоинты
`/api/auth/login`, `/api/auth/refresh-tokens`, `/api/auth/logout`, а не на все
запросы API.

### 3.7. Logout — `POST /api/auth/logout`

Читает `req.cookies.refreshToken`, удаляет его из таблицы `Token`
(`deleteMany`), чистит cookie (`clearCookie`). Нюанс: у метода **нет `@Public`**,
поэтому logout тоже требует валидный access-token.

### 3.8. Сид администратора (`seed.ts`, вызывается в `main.ts` при старте)

Если пользователя с `ADMIN_EMAIL` (дефолт `admin@example.com`) нет — создаёт его
с bcrypt-хешем `ADMIN_PASSWORD` (дефолт `admin`) и ролью `['ADMIN']`. Повторный
запуск ничего не перезаписывает.

## 4. Фронтенд

### 4.1. Где лежат токены (`api/base.ts`)

```ts
let accessToken: string | null = null  // в памяти модуля (НЕ localStorage, НЕ cookie)
```

- **access — в памяти**: не в `localStorage` (чтобы не украли через XSS) и не в
  cookie (чтобы не уходил автоматически и не страдал от CSRF).
- **refresh — в httpOnly-cookie**, которой управляет браузер.

### 4.2. Запросы — `baseQueryWithReauth`

Это `baseQuery` у `emptySplitApi`, на котором собран весь сгенерированный API.

```ts
rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include',     // чтобы refresh-cookie уходила
  prepareHeaders: (headers) => { if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`) },
})
```

`baseQueryWithReauth` оборачивает `rawBaseQuery`:

- выполняет запрос;
- если `401`:
  - запускает **single-flight refresh** (через `refreshPromise`, чтобы несколько
    параллельных 401 не вызвали несколько одновременных ротаций);
  - `POST /api/auth/refresh-tokens` (cookie уйдёт автоматически);
  - при успехе — обновляет `accessToken` в памяти и **повторяет исходный запрос**;
  - при неудаче — обнуляет access-token и диспатчит `clearUser()`.

### 4.3. Состояние авторизации в Redux (`store/authSlice.ts`)

```ts
{ user: UserDto | null, isAuthenticated: boolean, isLoading: boolean }
```

`setUser` / `clearUser` / `setLoading`. `isAuthenticated` используется в
`AuthGuard` (редирект на `/auth/login`) и в шапке.

### 4.4. Сценарии на фронте

**Логин** (`routes/auth/login.tsx`):

```ts
const res = await login({ loginDto: data }).unwrap() // useAuthControllerLoginMutation
setAccessToken(res.accessToken)       // кладём access в память
dispatch(setUser(res.user))           // кладём юзера в Redux
navigate({ to: '/' })
```

**Гидратация при загрузке страницы** (`routes/__root.tsx`): вызывается
`useUserControllerGetMeQuery()` — если в браузере есть валидная refresh-cookie,
access молча восстанавливается (через `baseQueryWithReauth`), `GET /user/me`
возвращает пользователя и `dispatch(setUser(...))`. После перезагрузки F5 сессия
не теряется.

**Logout** (`components/Profile.tsx`): `logout()` → затем `setAccessToken(null)` +
`dispatch(clearUser())` + редирект.

## 5. Полные сценарии

**Логин**

```
браузер → POST /api/auth/login {email,password}
        ← 200 {accessToken, user} + Set-Cookie: refreshToken (httpOnly, /api/auth)
frontend: accessToken в память, user в Redux
```

**Обычный защищённый запрос**

```
браузер → GET /api/products  (+ Authorization: Bearer <access>)
        ← 200 (JWTAuthGuard проверил подпись/срок → JwtStrategy подгрузил user → RolesGuard проверил роль)
```

**Истёк access (15 мин)**

```
браузер → GET /api/products (+ устаревший access)
        ← 401
baseQueryWithReauth → POST /api/auth/refresh-tokens (cookie ушла сама)
        ← 200 {accessToken, refreshToken} + новая cookie (старый refresh удалён)
baseQueryWithReauth → повтор GET /api/products (с новым access)
        ← 200
```

**Истёк/украден refresh**

```
refresh-tokens возвращает 401 → baseQueryWithReauth очищает access, dispatch(clearUser())
→ AuthGuard редиректит на /auth/login
```

## 6. Почему именно так (безопасность)

| Решение | Защищает от |
|---|---|
| access в памяти, не в localStorage | XSS (нельзя вытащить токен через JS) |
| access передаётся только заголовком, не cookie | CSRF (браузер не подставит токен сам) |
| refresh в httpOnly-cookie | XSS (JS не читает) |
| refresh `path=/api/auth` + `sameSite=lax` | сужает поверхность, где cookie уходит |
| ротация refresh-токена | переиспользование украденного refresh быстро инвалидируется |
| bcrypt(10) для пароля | утечка БД не раскрывает пароли |

## 7. Нюанс для продакшена

`JWT_SECRET` в `docker-compose.yml` не задан, а `.env` в образ не копируется —
поэтому в контейнере используется дефолт `'super-secret-jwt-key'`. Для продакшена
нужно вынести секрет в переменные окружения (`JWT_SECRET` в compose или в
оркестратор/секреты).
