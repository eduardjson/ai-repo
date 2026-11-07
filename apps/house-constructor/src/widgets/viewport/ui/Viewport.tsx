import { ContactShadows } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { useAppSelector } from '@/app/hooks'
import type { ToolId } from '@/features/tools'
import {
  CameraController,
  CoordinateSystem,
  FootprintDrawer,
  GroundPlane,
  HouseScene,
  ViewportControls,
} from '@/widgets/scene'

import { JumperMenu } from './JumperMenu'

import './Viewport.css'

const TOOL_HINTS: Record<ToolId, string> = {
  select: 'Клик по проёму или перемычке — выбрать. ЛКМ — вращение, колесо — масштаб, ПКМ — сдвиг.',
  addWindow: 'Кликните по стене, чтобы разместить окно.',
  addDoor: 'Кликните по стене, чтобы разместить дверь.',
  drawFootprint: 'Протяните прямоугольник по земле, чтобы задать контур здания.',
}

export function Viewport() {
  const tool = useAppSelector((state) => state.tools.tool)

  return (
    <div className="viewport">
      <Canvas shadows camera={{ position: [14, 10, 14], fov: 45, near: 0.1, far: 800 }}>
        <color attach="background" args={['#e9edf1']} />
        <hemisphereLight args={['#ffffff', '#c8ced4', 1.15]} />
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[25, 40, 20]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={200}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
        />

        <CoordinateSystem />
        <GroundPlane />
        <HouseScene />
        <FootprintDrawer />
        <ContactShadows position={[0, 0, 0]} opacity={0.32} scale={120} blur={2.4} far={40} />

        <CameraController />
        <ViewportControls />
      </Canvas>

      <div className="viewport__hint">{TOOL_HINTS[tool]}</div>
      <JumperMenu />
    </div>
  )
}
