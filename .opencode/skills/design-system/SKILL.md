---
name: Design System
description: UI/UX conventions and design tokens for the СтройМат frontend (React + MUI). Use when building or styling pages, components, widgets, or features to keep the design consistent.
---

# Design System — СтройМат

Соглашения по дизайну фронтенда проекта. Применяй при создании любых
страниц, компонентов, виджетов и правке стилей.

## Стек стилей

- **React 19 + MUI v7** (`@mui/material`, `@mui/icons-material`) + Emotion через `sx`.
- **MUI — единственная система стилей.** Tailwind удалён;
  новые стили пиши через `sx` и тему MUI, не через Tailwind-классы.
- Уведомления — `react-toastify` (bottom-right).

## Цвета (токены)

Не хардкодь hex в компонентах — бери из темы: `sx={{ color: 'success.main' }}`.

| Токен      | Light     | Dark      | Назначение |
|------------|-----------|-----------|------------|
| primary    | `#1976d2` | `#90caf9` | бренд, действия, ссылки, активная навигация |
| secondary  | `#dc004e` | `#f48fb1` | акцент, выделение |
| success    | `#2e7d32` | `#66bb6a` | завершено / позитив |
| warning    | `#ed6c02` | `#ffa726` | ожидание / в работе |
| error      | `#d32f2f` | `#f44336` | ошибка / отменено / деструктив |
| info       | `#0288d1` | `#29b6f6` | нейтральная информация |
| background/paper/text/divider | MUI default | MUI default | поверхности, текст, границы |

Статусы-отгрузок: `COMPLETED → success`, `PENDING → warning`, `CANCELLED → error`.

## Типографика

- Шрифт — Roboto (MUI default), не меняй.
- Заголовок страницы: `Typography variant="h4" sx={{ mb: 3 }}` (вес 700 задаёт тема).
- Заголовок секции: `Typography variant="h5"`/`"h6"` с `sx={{ mb: 2 }}`.
- Основной текст: `body1`; вторичный/подписи: `body2` + `color="text.secondary"`.
- Заголовки таблиц: MUI default (или `fontWeight: 600`).

## Отступы (сетка 8px)

База 8px. В `sx` используй тему: `mb: 2` = 16px, `mb: 3` = 24px.

- Вертикальный отступ контента страницы: `py: 3`.
- Шапка страницы (заголовок + действие): `mb: 3`.
- Строка фильтров: `gap: 2`, `mb: 3`, `flexWrap: 'wrap'`.
- Поля формы: `gap: 2`.
- Отступ содержимого карточки: `p: 3` (списки) / `p: 4` (детали, формы).
- Ячейки таблицы: default.

## Каркас страницы

- `AppBar` sticky, `color="default"`, `elevation={2}`. Toolbar: бренд (h6 bold,
  `color="primary.main"`) + навигация `Tabs` + справа действия (Profile, ThemeToggle).
- Контент: `Container maxWidth="xl"` с `py: 3`.
- Шапка страницы: flex-строка `display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', mb: 3`; слева заголовок, справа основная кнопка действия.

## Паттерны компонентов

- **Кнопки**: основное действие `variant="contained"` (+ `startIcon`); вторичное
  `variant="outlined"`; деструктив `color="error"`; иконки в строках — `IconButton size="small"`.
- **Списки/таблицы**: `TableContainer component={Paper} elevation={1}` + MUI
  `Table size="small"`/`TableHead`/`TableBody`. НЕ использовать сырой `<table>`.
- **Пустое состояние**: `<TableCell colSpan={n} align="center" sx={{ py: 4, color: 'text.secondary' }}>Нет данных</TableCell>`.
- **Формы (диалог)**: `Dialog maxWidth="sm" fullWidth`; `DialogTitle`; `DialogContent
  sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}`; `DialogActions` =
  Отмена (text/outlined) + Сохранить (`contained`).
- **Детальный просмотр**: `Card elevation={2}` + `CardContent sx={{ p: 4 }}`.
- **Статус**: `Chip` с семантическим цветом + русская подпись.
- **Подтверждение удаления**: переиспользуемый `ActionModal`.
- **Уведомления**: `react-toastify`, позиция bottom-right.

## Do / Don't

- ✅ `sx` + токены темы (`primary.main`, `success.main`, `text.secondary`).
- ✅ единая сетка 8px; MUI `Table`; семантические цвета статусов.
- ✅ консистентный каркас страницы (заголовок + действия + таблица/диалог).
- ❌ хардкод hex (`#888`, `#ddd`); микс Tailwind + MUI; сырой `<table>`; разнобой в `mb`/`p`.
