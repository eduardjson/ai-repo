import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Defaults to localhost for local development; overridden to the Docker
  // service name ("server") inside docker-compose.
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:3000'
  // URL remote-приложения «Конструктор» (Module Federation). Локально —
  // dev-сервер remote на 5174; в проде — отдельный хост/CDN.
  const constructorRemote = env.VITE_CONSTRUCTOR_REMOTE || 'http://localhost:5174/remoteEntry.js'

  return {
    plugins: [
      react(),
      federation({
        name: 'host',
        // Типы remote объявлены вручную в src/mf-remotes.d.ts — генерация DTS
        // не нужна и вызывает фоновые ошибки при dev-рестарте.
        dts: false,
        remotes: {
          houseConstructor: {
            type: 'module',
            name: 'houseConstructor',
            entry: constructorRemote,
          },
        },
      }),
    ],
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/socket.io': {
          target: apiTarget,
          ws: true,
        },
      },
    },
  }
})
