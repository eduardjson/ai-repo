import { useEffect, useMemo, useState } from 'react'
import { Box } from '@mui/material'
import type { ModuleConfig } from './estimate'
import { buildDrawingSvg } from './drawing'

export function ModuleDrawing({ config }: { config: ModuleConfig }) {
  const [url, setUrl] = useState<string>('')

  const svg = useMemo(() => buildDrawingSvg(config), [config])

  useEffect(() => {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [svg])

  return (
    <Box
      component="img"
      src={url}
      alt="Чертёж модуля"
      sx={{
        width: '100%',
        height: 560,
        objectFit: 'contain',
        bgcolor: '#ffffff',
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
      }}
    />
  )
}
