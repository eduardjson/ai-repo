import { useEffect, useRef, useState } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'

// Конструктор — отдельное приложение (apps/house-constructor), подключаемое
// через Module Federation. Remote самодостаточен (свой React/Redux/стили) и
// экспортирует функцию mount(), которая создаёт собственный React-root внутри
// контейнера. Хост не шарит с ним ни React, ни какие-либо зависимости.

export function ConstructorPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let unmount: (() => void) | undefined
    let cancelled = false

    import('houseConstructor/mount')
      .then((mod) => {
        if (cancelled) return
        unmount = mod.mount(container)
        setState('ready')
      })
      .catch((err) => {
        console.error('Не удалось загрузить конструктор', err)
        if (!cancelled) setState('error')
      })

    return () => {
      cancelled = true
      unmount?.()
    }
  }, [])

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        // AppBar (~64px) + отступы <main> (~48px)
        height: 'calc(100vh - 112px)',
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
        }}
      />

      {state === 'loading' && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {state === 'error' && (
        <Box sx={{ position: 'absolute', inset: 0, p: 3 }}>
          <Typography color="error">
            Не удалось загрузить конструктор. Запущен ли dev-сервер remote (порт 5174)?
          </Typography>
        </Box>
      )}
    </Box>
  )
}
