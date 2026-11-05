import { createTheme } from '@mui/material/styles'

const lightPalette = {
  primary: { main: '#1976d2' },
  secondary: { main: '#dc004e' },
  success: { main: '#2e7d32' },
  warning: { main: '#ed6c02' },
  error: { main: '#d32f2f' },
  info: { main: '#0288d1' },
}

const darkPalette = {
  primary: { main: '#90caf9' },
  secondary: { main: '#f48fb1' },
  success: { main: '#66bb6a' },
  warning: { main: '#ffa726' },
  error: { main: '#f44336' },
  info: { main: '#29b6f6' },
}

const typography = {
  h4: { fontWeight: 700 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
}

// Единый вид таблиц во всём приложении: одинаковая высота строк, отступы и ховер.
const components = {
  MuiTableRow: {
    styleOverrides: {
      root: {
        height: '52px',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      sizeSmall: {
        padding: '6px 16px',
      },
    },
  },
}

export const lightTheme = createTheme({
  palette: { mode: 'light', ...lightPalette },
  typography,
  components,
})

export const darkTheme = createTheme({
  palette: { mode: 'dark', ...darkPalette },
  typography,
  components,
})
