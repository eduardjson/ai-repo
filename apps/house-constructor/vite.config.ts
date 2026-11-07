import { fileURLToPath, URL } from 'node:url'

import { federation } from '@module-federation/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Remote-приложение «Конструктор» (Module Federation).
// НЕ шарит React с хостом — бандлит собственный React 19.3, HeroUI, Tailwind, R3F.
// Интеграция с хостом — через экспортируемую функцию mount()/unmount().
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'houseConstructor',
      filename: 'remoteEntry.js',
      dts: false,
      exposes: {
        './mount': './src/remote.tsx',
      },
      // `shared` намеренно отсутствует: remote самодостаточен и не завязан
      // на зависимостях хоста (свой React, своя UI-библиотека и т.д.).
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'esnext',
  },
  server: {
    port: 5174,
    strictPort: true,
    origin: 'http://localhost:5174',
    cors: true,
  },
  preview: {
    port: 5174,
    strictPort: true,
  },
})
