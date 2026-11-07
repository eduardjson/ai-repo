/**
 * Универсальное описание трёхмерного бокса для отрисовки.
 * Все координаты — в локальной системе здания (центр в начале координат).
 */
export interface BoxSpec {
  id: string
  position: [number, number, number]
  size: [number, number, number]
  rotation?: [number, number, number]
  color: string
  /** Базовая непрозрачность материала (0..1). */
  opacity?: number
}

/** Треугольная грань (например, фронтон кровли). */
export interface TriangleSpec {
  id: string
  a: [number, number, number]
  b: [number, number, number]
  c: [number, number, number]
  color: string
  opacity?: number
}
