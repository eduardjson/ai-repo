import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App'

// Точка входа для standalone-разработки конструктора (`npm run dev`).
// В production приложение грузится хостом через Module Federation и этот
// файл не используется.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CssBaseline />
    <App />
  </StrictMode>,
)
