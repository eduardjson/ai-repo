import { IconButton, Tooltip } from '@mui/material'
import { DarkMode, LightMode } from '@mui/icons-material'
import { useThemeMode } from '../contexts/ThemeContext'

export function ThemeToggle() {
  const { mode, toggleTheme } = useThemeMode()

  return (
    <Tooltip title={mode === 'light' ? 'Тёмная тема' : 'Светлая тема'}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          bgcolor: 'background.paper',
          boxShadow: 4,
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        {mode === 'light' ? <DarkMode /> : <LightMode />}
      </IconButton>
    </Tooltip>
  )
}
