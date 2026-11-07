import { createTheme } from '@mui/material/styles'

// Remote-приложение поставляет собственную тему (не наследует тему хоста).
// Палитра повторяет светлую/тёмную тему основного приложения, чтобы вкладка
// выглядела согласованно. Режим выбирается пропом `themeMode`.
const typography = {
  h4: { fontWeight: 700 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
}

export const constructorLightTheme = createTheme({
  palette: { mode: 'light', primary: { main: '#1976d2' }, secondary: { main: '#dc004e' } },
  typography,
})

export const constructorDarkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#90caf9' }, secondary: { main: '#48d1cc' } },
  typography,
})
