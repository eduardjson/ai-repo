import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
  // Что НЕ линтуем: сборка, зависимости и сгенерированный API-клиент (правится кодгеном).
  // vite.config.ts / openapi-config.cjs не входят в tsconfig (include: ["src"]),
  // поэтому type-aware правила для них недоступны.
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/api/generated.ts',
      '**/vite.config.ts',
      'openapi-config.cjs',
      'eslint.config.mjs',
    ],
  },

  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        // Type-aware линтинг: сам найдёт tsconfig.json и подтянет типы.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      // Fast Refresh: не мешать экспорт компонентов с константами.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // ===== Строгость типов (значения можно менять по вкусу) =====

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
      // async-функция в синхронном колбэке (частый кейс в React/MUI) — предупреждение.
      '@typescript-eslint/no-misused-promises': 'warn',
      // Опасные операции на `any`/`unknown` — предупреждение, чтобы не блокировать.
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
    },
  },

  // React Hooks (React 19): rules-of-hooks, exhaustive-deps и compiler-правила.
  // compiler-правила понижены до warning — код писался без React Compiler.
  {
    files: ['**/*.{ts,tsx}'],
    ...reactHooks.configs.flat['recommended-latest'],
    rules: {
      'react-hooks/static-components': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/void-use-memo': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/globals': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/error-boundaries': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-render': 'warn',
      'react-hooks/config': 'warn',
      'react-hooks/gating': 'warn',
    },
  },

  // Гасим конфликты ESLint/Prettier. Обязательно последним.
  eslintConfigPrettier,
)
