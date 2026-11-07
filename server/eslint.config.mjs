import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
  // Что НЕ линтуем: сборка и сгенерированный Prisma-клиент (правится кодгеном).
  {
    ignores: ['dist/**', 'node_modules/**', 'src/generated/**', 'eslint.config.mjs'],
  },

  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
      parserOptions: {
        // Type-aware линтинг: сам найдёт tsconfig.json и подтянет типы.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // ===== Строгость типов (значения можно менять по вкусу) =====

      // console-вывод — предупреждение (в коде используй Nest Logger).
      'no-console': 'warn',

      // `any` — предупреждение (не ошибка, чтобы не блокировать сборку).
      '@typescript-eslint/no-explicit-any': 'warn',

      // Неиспользуемые переменные/аргументы — ошибка; префикс `_` разрешён.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],

      // Типы импортировать через `import type` — предупреждение (можно «error» + --fix).
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/consistent-type-exports': 'warn',

      // Лишние проверки на заведомо истинные/ложные условия — предупреждение.
      '@typescript-eslint/no-unnecessary-condition': 'warn',

      // `!` (non-null assertion) — предупреждение.
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // ===== Смягчённые type-aware правила (шумные на существующем коде) =====
      // Опасные операции на `any`/`unknown` — предупреждение, чтобы не блокировать.
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
    },
  },

  // Гасим конфликты ESLint/Prettier. Обязательно последним.
  eslintConfigPrettier,
)
