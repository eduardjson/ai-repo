import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
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
} from '@mui/material'

// ─── Смета ────────────────────────────────────────────────────────────────

interface EstimateLine {
  name: string
  unit: string
  quantity: number
  rate: number
}

interface Estimate {
  floorArea: number
  wallArea: number
  roofArea: number
  materials: EstimateLine[]
  works: EstimateLine[]
  materialsTotal: number
  worksTotal: number
  total: number
}

function calculateEstimate(length: number, width: number, height: number): Estimate {
  const floorArea = length * width
  const wallArea = 2 * (length + width) * height
  const roofArea = length * width
  const insulationArea = wallArea + roofArea + floorArea

  const materials: EstimateLine[] = [
    { name: 'Каркас (брус 50×150)', unit: 'м²', quantity: wallArea, rate: 480 },
    { name: 'Обшивка стен (OSB-3)', unit: 'м²', quantity: wallArea * 2, rate: 420 },
    { name: 'Утеплитель (минвата 100 мм)', unit: 'м²', quantity: insulationArea, rate: 340 },
    { name: 'Кровля (профлист)', unit: 'м²', quantity: roofArea, rate: 690 },
    { name: 'Пол (фанера + доска)', unit: 'м²', quantity: floorArea, rate: 640 },
    { name: 'Окно ПВХ (1000×1000)', unit: 'шт', quantity: Math.max(1, Math.round(length / 3)), rate: 8500 },
    { name: 'Дверь входная', unit: 'шт', quantity: 1, rate: 14500 },
  ]

  const works: EstimateLine[] = [
    { name: 'Монтаж каркаса и обшивки', unit: 'м²', quantity: wallArea, rate: 950 },
    { name: 'Утепление', unit: 'м²', quantity: insulationArea, rate: 260 },
    { name: 'Монтаж кровли', unit: 'м²', quantity: roofArea, rate: 720 },
    { name: 'Монтаж пола', unit: 'м²', quantity: floorArea, rate: 600 },
    { name: 'Электромонтаж', unit: 'модуль', quantity: 1, rate: 26000 },
    { name: 'Внутренняя отделка', unit: 'м²', quantity: wallArea + floorArea, rate: 460 },
  ]

  const materialsTotal = materials.reduce((s, m) => s + m.quantity * m.rate, 0)
  const worksTotal = works.reduce((s, w) => s + w.quantity * w.rate, 0)

  return {
    floorArea,
    wallArea,
    roofArea,
    materials,
    works,
    materialsTotal,
    worksTotal,
    total: materialsTotal + worksTotal,
  }
}

const fmt = (n: number) => n.toLocaleString('ru-RU')
const fmtQty = (n: number) => (Number.isInteger(n) ? n.toString() : n.toFixed(1).replace('.', ','))
const fmtMoney = (n: number) => `${Math.round(n).toLocaleString('ru-RU')} ₽`

// ─── 3D-модель ────────────────────────────────────────────────────────────

function createModule(length: number, width: number, height: number): THREE.Group {
  const group = new THREE.Group()
  const t = 0.08

  const floorMat = new THREE.MeshStandardMaterial({ color: 0xb0bec5 })
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x90caf9, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x546e7a })

  const floor = new THREE.Mesh(new THREE.BoxGeometry(length, t, width), floorMat)
  floor.position.y = -t / 2
  group.add(floor)

  const front = new THREE.Mesh(new THREE.BoxGeometry(length, height, t), wallMat)
  front.position.set(0, height / 2, width / 2)
  group.add(front)

  const back = new THREE.Mesh(new THREE.BoxGeometry(length, height, t), wallMat)
  back.position.set(0, height / 2, -width / 2)
  group.add(back)

  const right = new THREE.Mesh(new THREE.BoxGeometry(t, height, width), wallMat)
  right.position.set(length / 2, height / 2, 0)
  group.add(right)

  const left = new THREE.Mesh(new THREE.BoxGeometry(t, height, width), wallMat)
  left.position.set(-length / 2, height / 2, 0)
  group.add(left)

  const roof = new THREE.Mesh(new THREE.BoxGeometry(length, t, width), roofMat)
  roof.position.y = height + t / 2
  group.add(roof)

  return group
}

interface ViewerState {
  scene: THREE.Scene
  moduleGroup: THREE.Group
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  controls: OrbitControls
  raf: number
}

function ModuleViewer({ length, width, height }: { length: number; width: number; height: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<ViewerState | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f5f5)

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
    camera.position.set(8, 6, 10)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.target.set(0, 1.2, 0)

    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const dir = new THREE.DirectionalLight(0xffffff, 1.2)
    dir.position.set(10, 15, 8)
    scene.add(dir)

    scene.add(new THREE.GridHelper(20, 20, 0xcfd8dc, 0xe0e0e0))

    const moduleGroup = createModule(length, width, height)
    scene.add(moduleGroup)

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    const state: ViewerState = { scene, moduleGroup, renderer, camera, controls, raf: 0 }
    stateRef.current = state

    const animate = () => {
      controls.update()
      renderer.render(scene, camera)
      state.raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(state.raf)
      window.removeEventListener('resize', resize)
      controls.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
      stateRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const state = stateRef.current
    if (!state) return
    state.scene.remove(state.moduleGroup)
    const next = createModule(length, width, height)
    state.moduleGroup = next
    state.scene.add(next)
  }, [length, width, height])

  return (
    <Box
      ref={containerRef}
      sx={{ width: '100%', height: 520, borderRadius: 1, overflow: 'hidden', border: 1, borderColor: 'divider' }}
    />
  )
}

// ─── UI-хелперы ───────────────────────────────────────────────────────────

function DimensionSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" fontWeight={600}>{value} м</Typography>
      </Box>
      <Slider value={value} onChange={(_, v) => onChange(v as number)} min={min} max={max} step={step} />
    </Box>
  )
}

function TotalRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant={bold ? 'h6' : 'body2'}>{label}</Typography>
      <Typography variant={bold ? 'h6' : 'body2'} fontWeight={bold ? 700 : 600}>{value}</Typography>
    </Box>
  )
}

// ─── Страница ─────────────────────────────────────────────────────────────

export function ConstructorPage() {
  const [length, setLength] = useState(6)
  const [width, setWidth] = useState(3)
  const [height, setHeight] = useState(2.5)

  const estimate = useMemo(() => calculateEstimate(length, width, height), [length, width, height])

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Конструктор</Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Размеры модуля</Typography>
            <DimensionSlider label="Длина" value={length} onChange={setLength} min={2} max={12} step={0.5} />
            <DimensionSlider label="Ширина" value={width} onChange={setWidth} min={2} max={6} step={0.5} />
            <DimensionSlider label="Высота" value={height} onChange={setHeight} min={2.2} max={4} step={0.1} />
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <TotalRow label="Площадь пола" value={`${fmt(estimate.floorArea)} м²`} />
              <TotalRow label="Площадь стен" value={`${fmt(estimate.wallArea)} м²`} />
              <TotalRow label="Площадь кровли" value={`${fmt(estimate.roofArea)} м²`} />
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Смета</Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Материалы</Typography>
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
                  {estimate.materials.map((m) => (
                    <TableRow key={m.name}>
                      <TableCell>{m.name}</TableCell>
                      <TableCell align="right">{fmtQty(m.quantity)} {m.unit}</TableCell>
                      <TableCell align="right">{fmtMoney(m.quantity * m.rate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>Работы</Typography>
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
                  {estimate.works.map((w) => (
                    <TableRow key={w.name}>
                      <TableCell>{w.name}</TableCell>
                      <TableCell align="right">{fmtQty(w.quantity)} {w.unit}</TableCell>
                      <TableCell align="right">{fmtMoney(w.quantity * w.rate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TotalRow label="Материалы" value={fmtMoney(estimate.materialsTotal)} />
              <TotalRow label="Работы" value={fmtMoney(estimate.worksTotal)} />
              <TotalRow label="Итого" value={fmtMoney(estimate.total)} bold />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <ModuleViewer length={length} width={width} height={height} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Вращение — левая кнопка мыши, масштаб — колесо, перемещение — правая кнопка.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  )
}
