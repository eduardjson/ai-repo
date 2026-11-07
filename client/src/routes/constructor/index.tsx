import { lazy, Suspense } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { getAccessToken, setAccessToken } from '../../api/base'
import { useThemeMode } from '../../contexts/ThemeContext'

// Конструктор вынесен в отдельное приложение (apps/house-constructor) и
// подгружается сюда через Module Federation. Ленивая загрузка — бандл
// конструктора (three.js, MUI, jspdf) тянется только при открытии вкладки.
const Builder = lazy(() => import('houseConstructor/Builder'))

export function ConstructorPage() {
  const { mode } = useThemeMode()

  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <Builder
        apiBaseUrl="/api"
        getAccessToken={getAccessToken}
        setAccessToken={setAccessToken}
        themeMode={mode}
      />
    </Suspense>
  )
}
