/**
 * Генерация уникальных идентификаторов для элементов модели.
 */
let counter = 0

export function createId(prefix = 'el'): string {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`
}
