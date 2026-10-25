import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { Box, Typography, Button } from '@mui/material'
import { VideocamOff, Refresh } from '@mui/icons-material'
import type { CameraType } from '@shared/types'

interface CameraViewProps {
  url: string
  type: CameraType
}

function HlsView({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    setError(null)

    let hls: Hls | null = null

    if (Hls.isSupported()) {
      hls = new Hls({ liveDurationInfinity: true, backBufferLength: 30 })
      hls.loadSource(url)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {})
      })
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          setError('Не удалось загрузить видеопоток')
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari: нативный HLS
      video.src = url
      video.play().catch(() => {})
    } else {
      setError('Браузер не поддерживает HLS')
    }

    return () => {
      hls?.destroy()
    }
  }, [url])

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 6, color: 'text.secondary' }}>
        <VideocamOff sx={{ fontSize: 48 }} />
        <Typography variant="body2">{error}</Typography>
        <Typography variant="caption">Проверьте URL камеры и её доступность</Typography>
      </Box>
    )
  }

  return (
    <Box
      component="video"
      ref={videoRef}
      controls
      muted
      playsInline
      autoPlay
      sx={{ width: '100%', height: '100%', bgcolor: '#000', objectFit: 'contain' }}
    />
  )
}

function MjpegView({ url }: { url: string }) {
  const [key, setKey] = useState(0)
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', bgcolor: '#000' }}>
      <Box component="img" src={url} key={key} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      <Button
        size="small"
        variant="outlined"
        startIcon={<Refresh />}
        onClick={() => setKey((k) => k + 1)}
        sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'background.paper' }}
      >
        Обновить
      </Button>
    </Box>
  )
}

function SnapshotView({ url }: { url: string }) {
  const [src, setSrc] = useState(url)
  const [tick, setTick] = useState(0)

  // периодическое обновление кадра (для статичных snapshot-камер)
  useEffect(() => {
    const id = setInterval(() => {
      setSrc(`${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`)
      setTick((t) => t + 1)
    }, 5000)
    return () => clearInterval(id)
  }, [url])

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', bgcolor: '#000' }}>
      <Box component="img" src={src} key={tick} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      <Button
        size="small"
        variant="outlined"
        startIcon={<Refresh />}
        onClick={() => setSrc(`${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`)}
        sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'background.paper' }}
      >
        Обновить
      </Button>
    </Box>
  )
}

export function CameraView({ url, type }: CameraViewProps) {
  return (
    <Box sx={{ width: '100%', height: 420, borderRadius: 1, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
      {type === 'hls' && <HlsView url={url} />}
      {type === 'mjpeg' && <MjpegView url={url} />}
      {type === 'snapshot' && <SnapshotView url={url} />}
    </Box>
  )
}
