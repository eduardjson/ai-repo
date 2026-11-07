/**
 * Полупрозрачная зелёная плоскость на уровне земли (y = 0),
 * чтобы пользователь видел, где находится уровень земли.
 * Не перехватывает события мыши (raycast отключён).
 */
export function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} raycast={() => null}>
      <planeGeometry args={[400, 400]} />
      <meshBasicMaterial color="#22c55e" transparent opacity={0.2} depthWrite={false} />
    </mesh>
  )
}
