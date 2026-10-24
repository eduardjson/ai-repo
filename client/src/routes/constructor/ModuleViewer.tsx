import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg'
import { Box } from '@mui/material'
import type { ModuleConfig } from './estimate'

const evaluator = new Evaluator()

function wallWithOpenings(
  length: number,
  height: number,
  thickness: number,
  openings: { x: number; y: number; w: number; h: number }[],
  material: THREE.Material,
): THREE.Mesh {
  const wallGeom = new THREE.BoxGeometry(length, height, thickness)
  wallGeom.translate(0, height / 2, 0)

  let brush = new Brush(wallGeom, material)
  for (const o of openings) {
    const openingGeom = new THREE.BoxGeometry(o.w, o.h, thickness * 1.5)
    openingGeom.translate(o.x, o.y, 0)
    brush = evaluator.evaluate(brush, new Brush(openingGeom, material), SUBTRACTION)
  }
  return new THREE.Mesh(brush.geometry, brush.material)
}

function createModule(cfg: ModuleConfig, wireframe: boolean): THREE.Group {
  const group = new THREE.Group()
  const t = 0.08
  const { length, width, height, windows, doors, partitions, roofType, wallColor, roofColor } = cfg

  const wallMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(wallColor),
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    wireframe,
  })
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xb0bec5, wireframe })
  const roofMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(roofColor), side: THREE.DoubleSide, wireframe })

  // Пол
  const floor = new THREE.Mesh(new THREE.BoxGeometry(length, t, width), floorMat)
  floor.position.y = -t / 2
  group.add(floor)

  // Фасадная стена с проёмами (окна + двери)
  const windowOpenings = Array.from({ length: windows }, (_, i) => ({
    x: -length / 2 + (length * (i + 1)) / (windows + 1),
    y: height * 0.6,
    w: 0.9,
    h: 1.0,
  }))
  const doorOpenings = Array.from({ length: doors }, (_, i) => ({
    x: length / 2 - 0.6 - i * 1.2,
    y: 1.05,
    w: 0.9,
    h: 2.1,
  }))
  const front = wallWithOpenings(length, height, t, [...windowOpenings, ...doorOpenings], wallMat)
  front.position.z = width / 2
  group.add(front)

  // Задняя стена (глухая)
  const back = new THREE.Mesh(new THREE.BoxGeometry(length, height, t), wallMat)
  back.position.set(0, height / 2, -width / 2)
  group.add(back)

  // Боковые стены
  const right = new THREE.Mesh(new THREE.BoxGeometry(t, height, width), wallMat)
  right.position.set(length / 2, height / 2, 0)
  group.add(right)

  const left = new THREE.Mesh(new THREE.BoxGeometry(t, height, width), wallMat)
  left.position.set(-length / 2, height / 2, 0)
  group.add(left)

  // Внутренние перегородки
  for (let i = 0; i < partitions; i++) {
    const x = -length / 2 + (length * (i + 1)) / (partitions + 1)
    const partition = new THREE.Mesh(new THREE.BoxGeometry(t, height, width), wallMat)
    partition.position.set(x, height / 2, 0)
    group.add(partition)
  }

  // Кровля
  if (roofType === 'gable') {
    const pitch = Math.max(0.8, width * 0.4)
    const shape = new THREE.Shape()
    shape.moveTo(-width / 2, 0)
    shape.lineTo(width / 2, 0)
    shape.lineTo(0, pitch)
    shape.closePath()
    const geom = new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false })
    geom.translate(0, height, -length / 2)
    group.add(new THREE.Mesh(geom, roofMat))
  } else {
    const roof = new THREE.Mesh(new THREE.BoxGeometry(length, t, width), roofMat)
    roof.position.y = height + t / 2
    group.add(roof)
  }

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

interface ModuleViewerProps {
  config: ModuleConfig
  viewMode: 'solid' | 'wireframe'
  resetSignal: number
}

export function ModuleViewer({ config, viewMode, resetSignal }: ModuleViewerProps) {
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

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200)
    camera.position.set(10, 7, 12)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.target.set(0, 1.4, 0)

    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const dir = new THREE.DirectionalLight(0xffffff, 1.2)
    dir.position.set(10, 15, 8)
    scene.add(dir)

    scene.add(new THREE.GridHelper(24, 24, 0xcfd8dc, 0xe0e0e0))

    const moduleGroup = createModule(config, viewMode === 'wireframe')
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
    const next = createModule(config, viewMode === 'wireframe')
    state.moduleGroup = next
    state.scene.add(next)
  }, [config, viewMode])

  useEffect(() => {
    const state = stateRef.current
    if (!state) return
    const maxDim = Math.max(config.length, config.width, config.height)
    state.camera.position.set(maxDim * 1.6, maxDim * 1.1, maxDim * 1.9)
    state.controls.target.set(0, config.height / 2, 0)
    state.controls.update()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal])

  return (
    <Box
      ref={containerRef}
      sx={{ width: '100%', height: 560, borderRadius: 1, overflow: 'hidden', border: 1, borderColor: 'divider' }}
    />
  )
}
