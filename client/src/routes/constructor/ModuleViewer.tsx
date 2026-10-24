import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Box } from '@mui/material'
import type { ModuleConfig } from './estimate'

function createModule(cfg: ModuleConfig, wireframe: boolean): THREE.Group {
  const group = new THREE.Group()
  const t = 0.08
  const { length, width, height, windows, doors, roofType, wallColor, roofColor } = cfg

  const wallMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(wallColor),
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    wireframe,
  })
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xb0bec5, wireframe })
  const roofMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(roofColor), side: THREE.DoubleSide, wireframe })
  const windowMat = new THREE.MeshStandardMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.6, wireframe })
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, wireframe })

  // Пол
  const floor = new THREE.Mesh(new THREE.BoxGeometry(length, t, width), floorMat)
  floor.position.y = -t / 2
  group.add(floor)

  // Стены (4)
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

  // Окна — на фасадной стене
  const windowGeom = new THREE.BoxGeometry(0.9, 1.0, 0.06)
  for (let i = 0; i < windows; i++) {
    const x = -length / 2 + (length * (i + 1)) / (windows + 1)
    const win = new THREE.Mesh(windowGeom, windowMat)
    win.position.set(x, height * 0.6, width / 2 + 0.03)
    group.add(win)
  }

  // Двери — на фасадной стене
  const doorGeom = new THREE.BoxGeometry(0.9, 2.1, 0.06)
  for (let i = 0; i < doors; i++) {
    const x = length / 2 - 0.6 - i * 1.2
    const door = new THREE.Mesh(doorGeom, doorMat)
    door.position.set(x, 1.05, width / 2 + 0.03)
    group.add(door)
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
