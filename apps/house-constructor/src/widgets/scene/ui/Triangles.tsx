import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import type { TriangleSpec } from '@/entities/layer'

interface TrianglesProps {
  triangles: TriangleSpec[]
  opacity?: number
}

/**
 * Рендерит треугольные грани (фронтоны кровли).
 */
export function Triangles({ triangles, opacity = 1 }: TrianglesProps) {
  const items = useMemo(
    () =>
      triangles.map((triangle) => {
        const geometry = new THREE.BufferGeometry()
        const vertices = new Float32Array([
          ...triangle.a,
          ...triangle.b,
          ...triangle.c,
        ])
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
        geometry.setIndex([0, 1, 2])
        geometry.computeVertexNormals()
        return { id: triangle.id, geometry, color: triangle.color }
      }),
    [triangles],
  )

  useEffect(() => {
    return () => {
      for (const item of items) item.geometry.dispose()
    }
  }, [items])

  const transparent = opacity < 0.999

  return (
    <>
      {items.map(({ id, geometry, color }) => (
        <mesh key={id} geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={color}
            roughness={0.8}
            metalness={0.05}
            side={THREE.DoubleSide}
            transparent={transparent}
            opacity={opacity}
            depthWrite={!transparent}
          />
        </mesh>
      ))}
    </>
  )
}
