import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { Provider } from 'react-redux'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ToastContainer } from 'react-toastify'

import { router } from './router'
import { store } from './store'
import { ThemeProvider, useThemeMode } from './contexts/ThemeContext'
import { lightTheme, darkTheme } from './theme/muiTheme'

import './App.css'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const { mode } = useThemeMode()
  return (
    <MuiThemeProvider theme={mode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        theme={mode}
      />
    </MuiThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
