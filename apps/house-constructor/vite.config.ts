import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

// Remote-приложение «Конструктор». Отдаёт компонент Builder через Module
// Federation; хост (client) подгружает его лениво во вкладке «Конструктор».
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'houseConstructor',
      filename: 'remoteEntry.js',
      dts: false,
      exposes: {
        './Builder': './src/remote.ts',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
      },
    }),
  ],
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
