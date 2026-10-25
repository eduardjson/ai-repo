import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material'
import { Search, Clear } from '@mui/icons-material'

export interface LatLng {
  lat: number
  lng: number
}

// Маркер-пин без внешних ассетов (divIcon) — не зависит от сборки картинок Leaflet.
const markerIcon = L.divIcon({
  className: '',
  html: `<svg width="30" height="40" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#d32f2f" stroke="#ffffff" stroke-width="1.5"/><circle cx="12" cy="12" r="4.5" fill="#ffffff"/></svg>`,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
})

const DEFAULT_CENTER: [number, number] = [55.7558, 37.6173] // Москва

interface LocationPickerProps {
  value?: LatLng | null
  onChange: (latlng: LatLng) => void
  height?: number
}

export function LocationPicker({ value, onChange, height = 300 }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Инициализация карты (с защитой от двойного монтирования в StrictMode).
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if ((container as unknown as { _leaflet_id?: number })._leaflet_id) return

    const map = L.map(container).setView(value ? [value.lat, value.lng] : DEFAULT_CENTER, value ? 15 : 5)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    map.on('click', (e: L.LeafletMouseEvent) => {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    })

    mapRef.current = map
    if (value) {
      markerRef.current = L.marker([value.lat, value.lng], { icon: markerIcon }).addTo(map)
    }

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Синхронизация маркера при изменении value (клик, поиск, загрузка при редактировании).
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markerRef.current?.remove()
    markerRef.current = null
    if (value) {
      markerRef.current = L.marker([value.lat, value.lng], { icon: markerIcon }).addTo(map)
    }
  }, [value])

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    setError(null)
    try {
      // Nominatim (OpenStreetMap) — бесплатный геокодер без ключа.
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=ru&q=${encodeURIComponent(query.trim())}`,
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) {
        setError('Ничего не найдено')
        return
      }
      const lat = parseFloat(data[0].lat)
      const lng = parseFloat(data[0].lon)
      onChange({ lat, lng })
      mapRef.current?.setView([lat, lng], 15, { animate: true })
    } catch {
      setError('Не удалось найти адрес')
    } finally {
      setSearching(false)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Найти адрес (например, Москва, Тверская 1)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSearch()
            }
          }}
          InputProps={{
            endAdornment: query ? (
              <Button size="small" onClick={() => setQuery('')} sx={{ minWidth: 0, p: 0.5 }}><Clear fontSize="small" /></Button>
            ) : undefined,
          }}
        />
        <Button variant="outlined" size="small" startIcon={<Search />} onClick={handleSearch} disabled={searching}>
          {searching ? <CircularProgress size={18} /> : 'Найти'}
        </Button>
      </Box>

      <Box
        ref={containerRef}
        sx={{
          height,
          width: '100%',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden',
          position: 'relative',
          isolation: 'isolate', // не даёт z-index Leaflet "вылезать" поверх MUI-оверлеев
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5, minHeight: 24 }}>
        {error ? (
          <Typography variant="caption" color="error">{error}</Typography>
        ) : value ? (
          <Typography variant="caption" color="text.secondary">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Кликните по карте или найдите адрес
          </Typography>
        )}
      </Box>
    </Box>
  )
}
