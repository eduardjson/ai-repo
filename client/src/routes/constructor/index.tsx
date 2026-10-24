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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import { RestartAlt, GridOn, Download, Print, Save, FolderOpen, Delete, ExpandMore } from '@mui/icons-material'
import { ModuleViewer } from './ModuleViewer'
import { calculateEstimate, exportEstimateCsv, exportEstimatePdf, defaultConfig, type ModuleConfig } from './estimate'
import { ROOF_MATERIALS, WALL_TYPES, FOUNDATIONS, WALL_COLORS, ROOF_COLORS, DEFAULT_RATES, type RateMap, type Option, type ColorOption } from './config'
import { useGetProjectsQuery, useCreateProjectMutation, useUpdateProjectMutation, useDeleteProjectMutation, type ProjectDto } from '../../api/projectApi'
import { useGetPriceListQuery } from '../../api/warehouseApi'

const fmt = (n: number) => n.toLocaleString('ru-RU')
const fmtQty = (n: number) => (Number.isInteger(n) ? n.toString() : n.toFixed(1).replace('.', ','))
const fmtMoney = (n: number) => `${Math.round(n).toLocaleString('ru-RU')} ₽`

const RATE_FIELDS: { key: string; label: string }[] = [
  { key: 'foundation_piles', label: 'Фундамент — сваи' },
  { key: 'foundation_tape', label: 'Фундамент — лента' },
  { key: 'foundation_slab', label: 'Фундамент — плита' },
  { key: 'wall_frame', label: 'Стены — каркас' },
  { key: 'wall_sip', label: 'Стены — СИП' },
  { key: 'wall_gas', label: 'Стены — газобетон' },
  { key: 'roof_proflist', label: 'Кровля — профлист' },
  { key: 'roof_metal', label: 'Кровля — металлочерепица' },
  { key: 'roof_soft', label: 'Кровля — мягкая' },
  { key: 'osb', label: 'Обшивка OSB-3' },
  { key: 'insulation_wall', label: 'Утепление стен' },
  { key: 'insulation_roof', label: 'Утепление кровли' },
  { key: 'insulation_floor', label: 'Утепление пола' },
  { key: 'floor', label: 'Напольное покрытие' },
  { key: 'partition', label: 'Перегородки' },
  { key: 'finish_in', label: 'Внутренняя отделка' },
  { key: 'finish_out', label: 'Наружная отделка' },
  { key: 'window', label: 'Окно ПВХ' },
  { key: 'door', label: 'Дверь' },
  { key: 'electric', label: 'Электромонтаж' },
  { key: 'plumbing', label: 'Сантехника' },
  { key: 'work_mount', label: 'Монтаж стен/кровли' },
  { key: 'work_floor', label: 'Монтаж пола' },
]

function SliderField({ label, value, onChange, min, max, step, display }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; display: string
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

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: Option[]
}) {
  return (
    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
      <InputLabel>{label}</InputLabel>
      <Select value={value} label={label} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
      </Select>
    </FormControl>
  )
}

function ColorPicker({ label, options, value, onChange }: {
  label: string; options: ColorOption[]; value: string; onChange: (v: string) => void
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
                width: 28, height: 28, borderRadius: '50%', bgcolor: c.value, cursor: 'pointer',
                border: '2px solid', borderColor: value === c.value ? 'primary.main' : 'divider',
                transition: 'transform 0.1s', '&:hover': { transform: 'scale(1.1)' },
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
  const [partitions, setPartitions] = useState(defaultConfig.partitions)
  const [roofType, setRoofType] = useState<'flat' | 'gable'>(defaultConfig.roofType)
  const [roofMaterial, setRoofMaterial] = useState(defaultConfig.roofMaterial)
  const [wallType, setWallType] = useState(defaultConfig.wallType)
  const [foundation, setFoundation] = useState(defaultConfig.foundation)
  const [wallColor, setWallColor] = useState(defaultConfig.wallColor)
  const [roofColor, setRoofColor] = useState(defaultConfig.roofColor)
  const [margin, setMargin] = useState(defaultConfig.margin)
  const [rates, setRates] = useState<RateMap>({ ...DEFAULT_RATES })
  const [viewMode, setViewMode] = useState<'solid' | 'wireframe'>('solid')
  const [resetSignal, setResetSignal] = useState(0)

  const [saveOpen, setSaveOpen] = useState(false)
  const [loadOpen, setLoadOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data: projects } = useGetProjectsQuery()
  const [createProject] = useCreateProjectMutation()
  const [updateProject] = useUpdateProjectMutation()
  const [deleteProject] = useDeleteProjectMutation()
  const { data: priceList } = useGetPriceListQuery({})

  const config = useMemo<ModuleConfig>(
    () => ({ length, width, height, windows, doors, partitions, roofType, roofMaterial, wallType, foundation, wallColor, roofColor, margin }),
    [length, width, height, windows, doors, partitions, roofType, roofMaterial, wallType, foundation, wallColor, roofColor, margin],
  )

  const estimate = useMemo(() => calculateEstimate(config, rates), [config, rates])

  const applyConfig = (cfg: ModuleConfig) => {
    setLength(cfg.length); setWidth(cfg.width); setHeight(cfg.height)
    setWindows(cfg.windows); setDoors(cfg.doors); setPartitions(cfg.partitions)
    setRoofType(cfg.roofType); setRoofMaterial(cfg.roofMaterial); setWallType(cfg.wallType)
    setFoundation(cfg.foundation); setWallColor(cfg.wallColor); setRoofColor(cfg.roofColor); setMargin(cfg.margin)
  }

  const handleSave = async () => {
    if (!projectName.trim()) return
    if (editingId) {
      await updateProject({ id: editingId, name: projectName.trim(), config })
    } else {
      const created = await createProject({ name: projectName.trim(), config }).unwrap()
      setEditingId(created.id)
    }
    setSaveOpen(false)
  }

  const handleLoad = (p: ProjectDto) => {
    applyConfig(p.config as ModuleConfig)
    setEditingId(p.id)
    setProjectName(p.name)
    setLoadOpen(false)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">Конструктор</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<FolderOpen />} onClick={() => setLoadOpen(true)}>Проекты</Button>
          <Button variant="contained" startIcon={<Save />} onClick={() => setSaveOpen(true)}>{editingId ? 'Обновить проект' : 'Сохранить'}</Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Параметры модуля</Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Габариты</Typography>
            <SliderField label="Длина" value={length} onChange={setLength} min={2} max={12} step={0.5} display={`${length} м`} />
            <SliderField label="Ширина" value={width} onChange={setWidth} min={2} max={6} step={0.5} display={`${width} м`} />
            <SliderField label="Высота" value={height} onChange={setHeight} min={2.2} max={4} step={0.1} display={`${height} м`} />

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Проёмы и планировка</Typography>
            <SliderField label="Окна" value={windows} onChange={setWindows} min={0} max={8} step={1} display={`${windows} шт`} />
            <SliderField label="Двери" value={doors} onChange={setDoors} min={0} max={4} step={1} display={`${doors} шт`} />
            <SliderField label="Перегородки" value={partitions} onChange={setPartitions} min={0} max={4} step={1} display={`${partitions} шт`} />

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Конструктив</Typography>
            <ToggleButtonGroup value={roofType} exclusive onChange={(_, v) => v && setRoofType(v)} size="small" fullWidth sx={{ mb: 2 }}>
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

          <Accordion sx={{ mb: 3 }} defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">Расценки (₽ за единицу)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1}>
                {RATE_FIELDS.map((f) => (
                  <Grid size={{ xs: 6 }} key={f.key}>
                    <TextField
                      label={f.label}
                      type="number"
                      size="small"
                      fullWidth
                      value={rates[f.key]}
                      onChange={(e) => setRates((prev) => ({ ...prev, [f.key]: Number(e.target.value) || 0 }))}
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 3 }} defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">Прайс-лист (справочно)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {!priceList || priceList.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Прайс-лист пуст. Добавьте позиции на странице «Цены».</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead><TableRow><TableCell>Товар</TableCell><TableCell align="right">Цена</TableCell></TableRow></TableHead>
                    <TableBody>
                      {priceList.map((p, i) => (
                        <TableRow key={`${p.productId}-${p.warehouseId}-${i}`}>
                          <TableCell>{p.productTitle}</TableCell>
                          <TableCell align="right">{p.salePrice ? fmtMoney(p.salePrice) : '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </AccordionDetails>
          </Accordion>

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Смета</Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Экспорт в CSV"><IconButton size="small" onClick={() => exportEstimateCsv(config, estimate)}><Download fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Экспорт в PDF"><IconButton size="small" onClick={() => exportEstimatePdf(config, estimate)}><Print fontSize="small" /></IconButton></Tooltip>
              </Box>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead><TableRow><TableCell>Наименование</TableCell><TableCell align="right">Кол-во</TableCell><TableCell align="right">Сумма</TableCell></TableRow></TableHead>
                <TableBody>
                  {estimate.sections.map((sec) => (
                    <Fragment key={sec.title}>
                      <TableRow><TableCell colSpan={3} sx={{ bgcolor: 'action.hover', fontWeight: 600 }}>{sec.title}</TableCell></TableRow>
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
                <Typography variant="body2">Площади (пол / стены / кровля)</Typography>
                <Typography variant="body2" fontWeight={600}>{fmt(estimate.floorArea)} / {fmt(estimate.netWallArea)} / {fmt(estimate.roofArea)} м²</Typography>
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
              <Tooltip title="Сбросить камеру"><IconButton size="small" onClick={() => setResetSignal((s) => s + 1)} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}><RestartAlt fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Каркасный режим"><IconButton size="small" onClick={() => setViewMode(viewMode === 'solid' ? 'wireframe' : 'solid')} sx={{ bgcolor: 'background.paper', boxShadow: 1, color: viewMode === 'wireframe' ? 'primary.main' : 'inherit' }}><GridOn fontSize="small" /></IconButton></Tooltip>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Вращение — левая кнопка мыши, масштаб — колесо, перемещение — правая кнопка. Стены полупрозрачны, окна/двери — реальные проёмы.
          </Typography>
        </Grid>
      </Grid>

      <Dialog open={saveOpen} onClose={() => setSaveOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingId ? 'Обновить проект' : 'Сохранить проект'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Название проекта" value={projectName} onChange={(e) => setProjectName(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave} disabled={!projectName.trim()}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={loadOpen} onClose={() => setLoadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Мои проекты</DialogTitle>
        <DialogContent>
          {!projects || projects.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Сохранённых проектов пока нет.</Typography>
          ) : (
            <List>
              {projects.map((p) => (
                <ListItem key={p.id} disablePadding secondaryAction={
                  <Tooltip title="Удалить"><IconButton edge="end" onClick={() => deleteProject(p.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                }>
                  <ListItemButton onClick={() => handleLoad(p)}>
                    <ListItemText primary={p.name} secondary={`Обновлён: ${new Date(p.updatedAt).toLocaleString('ru-RU')}`} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setLoadOpen(false)}>Закрыть</Button></DialogActions>
      </Dialog>
    </Box>
  )
}
