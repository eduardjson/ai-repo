import { Fragment, useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Slider,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  IconButton,
} from '@mui/material'
import { RestartAlt, GridOn, Download, Print } from '@mui/icons-material'
import { ModuleViewer } from './ModuleViewer'
import { calculateEstimate, exportEstimateCsv, defaultConfig, type ModuleConfig } from './estimate'
import { ROOF_MATERIALS, WALL_TYPES, FOUNDATIONS, WALL_COLORS, ROOF_COLORS, type Option, type ColorOption } from './config'

const fmt = (n: number) => n.toLocaleString('ru-RU')
const fmtQty = (n: number) => (Number.isInteger(n) ? n.toString() : n.toFixed(1).replace('.', ','))
const fmtMoney = (n: number) => `${Math.round(n).toLocaleString('ru-RU')} ₽`

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  display,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  display: string
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" fontWeight={600}>{display}</Typography>
      </Box>
      <Slider value={value} onChange={(_, v) => onChange(v as number)} min={min} max={max} step={step} />
    </Box>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: Option[]
}) {
  return (
    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
      <InputLabel>{label}</InputLabel>
      <Select value={value} label={label} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

function ColorPicker({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: ColorOption[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 1 }}>{label}</Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {options.map((c) => (
          <Tooltip key={c.value} title={c.label}>
            <Box
              onClick={() => onChange(c.value)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: c.value,
                cursor: 'pointer',
                border: '2px solid',
                borderColor: value === c.value ? 'primary.main' : 'divider',
                transition: 'transform 0.1s',
                '&:hover': { transform: 'scale(1.1)' },
              }}
            />
          </Tooltip>
        ))}
      </Box>
    </Box>
  )
}

export function ConstructorPage() {
  const [length, setLength] = useState(defaultConfig.length)
  const [width, setWidth] = useState(defaultConfig.width)
  const [height, setHeight] = useState(defaultConfig.height)
  const [windows, setWindows] = useState(defaultConfig.windows)
  const [doors, setDoors] = useState(defaultConfig.doors)
  const [roofType, setRoofType] = useState<'flat' | 'gable'>(defaultConfig.roofType)
  const [roofMaterial, setRoofMaterial] = useState(defaultConfig.roofMaterial)
  const [wallType, setWallType] = useState(defaultConfig.wallType)
  const [foundation, setFoundation] = useState(defaultConfig.foundation)
  const [wallColor, setWallColor] = useState(defaultConfig.wallColor)
  const [roofColor, setRoofColor] = useState(defaultConfig.roofColor)
  const [margin, setMargin] = useState(defaultConfig.margin)
  const [viewMode, setViewMode] = useState<'solid' | 'wireframe'>('solid')
  const [resetSignal, setResetSignal] = useState(0)

  const config = useMemo<ModuleConfig>(
    () => ({ length, width, height, windows, doors, roofType, roofMaterial, wallType, foundation, wallColor, roofColor, margin }),
    [length, width, height, windows, doors, roofType, roofMaterial, wallType, foundation, wallColor, roofColor, margin],
  )

  const estimate = useMemo(() => calculateEstimate(config), [config])

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Конструктор</Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Параметры модуля</Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Габариты</Typography>
            <SliderField label="Длина" value={length} onChange={setLength} min={2} max={12} step={0.5} display={`${length} м`} />
            <SliderField label="Ширина" value={width} onChange={setWidth} min={2} max={6} step={0.5} display={`${width} м`} />
            <SliderField label="Высота" value={height} onChange={setHeight} min={2.2} max={4} step={0.1} display={`${height} м`} />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Проёмы</Typography>
            <SliderField label="Окна" value={windows} onChange={setWindows} min={0} max={8} step={1} display={`${windows} шт`} />
            <SliderField label="Двери" value={doors} onChange={setDoors} min={0} max={4} step={1} display={`${doors} шт`} />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Конструктив</Typography>
            <ToggleButtonGroup
              value={roofType}
              exclusive
              onChange={(_, v) => v && setRoofType(v)}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
            >
              <ToggleButton value="flat">Плоская крыша</ToggleButton>
              <ToggleButton value="gable">Двускатная</ToggleButton>
            </ToggleButtonGroup>
            <SelectField label="Материал кровли" value={roofMaterial} onChange={setRoofMaterial} options={ROOF_MATERIALS} />
            <SelectField label="Тип стен" value={wallType} onChange={setWallType} options={WALL_TYPES} />
            <SelectField label="Фундамент" value={foundation} onChange={setFoundation} options={FOUNDATIONS} />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Внешний вид</Typography>
            <ColorPicker label="Цвет стен" options={WALL_COLORS} value={wallColor} onChange={setWallColor} />
            <ColorPicker label="Цвет кровли" options={ROOF_COLORS} value={roofColor} onChange={setRoofColor} />

            <Divider sx={{ my: 2 }} />

            <SliderField label="Наценка" value={margin} onChange={setMargin} min={0} max={50} step={1} display={`${margin} %`} />
          </Paper>

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Смета</Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Экспорт в CSV"><IconButton size="small" onClick={() => exportEstimateCsv(config, estimate)}><Download fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Печать"><IconButton size="small" onClick={() => window.print()}><Print fontSize="small" /></IconButton></Tooltip>
              </Box>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Наименование</TableCell>
                    <TableCell align="right">Кол-во</TableCell>
                    <TableCell align="right">Сумма</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {estimate.sections.map((sec) => (
                    <Fragment key={sec.title}>
                      <TableRow>
                        <TableCell colSpan={3} sx={{ bgcolor: 'action.hover', fontWeight: 600 }}>{sec.title}</TableCell>
                      </TableRow>
                      {sec.items.map((it) => (
                        <TableRow key={it.name}>
                          <TableCell sx={{ pl: 2 }}>{it.name}</TableCell>
                          <TableCell align="right">{fmtQty(it.quantity)} {it.unit}</TableCell>
                          <TableCell align="right">{fmtMoney(it.total)}</TableCell>
                        </TableRow>
                      ))}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Площадь пола / стен / кровли</Typography>
                <Typography variant="body2" fontWeight={600}>{fmt(estimate.floorArea)} / {fmt(estimate.wallArea)} / {fmt(estimate.roofArea)} м²</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Итого по смете</Typography>
                <Typography variant="body2" fontWeight={600}>{fmtMoney(estimate.subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Наценка ({margin}%)</Typography>
                <Typography variant="body2" fontWeight={600}>{fmtMoney(estimate.marginAmount)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="h6">Итого</Typography>
                <Typography variant="h6" color="primary.main">{fmtMoney(estimate.total)}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ position: 'relative' }}>
            <ModuleViewer config={config} viewMode={viewMode} resetSignal={resetSignal} />
            <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
              <Tooltip title="Сбросить камеру">
                <IconButton size="small" onClick={() => setResetSignal((s) => s + 1)} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}><RestartAlt fontSize="small" /></IconButton>
              </Tooltip>
              <Tooltip title="Каркасный режим">
                <IconButton size="small" onClick={() => setViewMode(viewMode === 'solid' ? 'wireframe' : 'solid')} sx={{ bgcolor: 'background.paper', boxShadow: 1, color: viewMode === 'wireframe' ? 'primary.main' : 'inherit' }}><GridOn fontSize="small" /></IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Вращение — левая кнопка мыши, масштаб — колесо, перемещение — правая кнопка. Стены полупрозрачны, чтобы видеть планировку.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  )
}
