/**
 * Математические утилиты общего назначения.
 */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Округляет значение до ближайшего шага (напр. 0.1 м). */
export function roundTo(value: number, step: number): number {
  if (step <= 0) return value
  return Math.round(value / step) * step
}
