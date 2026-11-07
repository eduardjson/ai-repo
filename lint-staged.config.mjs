// lint-staged: на staged-файлы перед коммитом гоняем eslint --fix + prettier --write.
// Всё запускается из корня; eslint берёт конфиг нужного пакета через --config,
// prettier подхватывает корневой .prettierrc.json и .prettierignore (--ignore-path).
export default {
  'client/**/*.{ts,tsx}': [
    'node client/node_modules/eslint/bin/eslint.js --config client/eslint.config.mjs --fix',
    'node client/node_modules/prettier/bin/prettier.cjs --write --ignore-path .prettierignore',
  ],
  'server/**/*.ts': [
    'node server/node_modules/eslint/bin/eslint.js --config server/eslint.config.mjs --fix',
    'node server/node_modules/prettier/bin/prettier.cjs --write --ignore-path .prettierignore',
  ],
  // Конфиги, стили и вёрстка в корне и в пакетах — только форматирование.
  // Markdown не трогаем, чтобы не переформатировать вручную свёрстанные таблицы.
  '**/*.{json,yml,yaml,css,html,cjs,mjs}': [
    'node client/node_modules/prettier/bin/prettier.cjs --write --ignore-path .prettierignore',
  ],
}
