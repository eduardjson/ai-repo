/**
 * Форматирование значений для отображения.
 */

export function formatMeters(value: number, digits = 2): string {
  return `${value.toFixed(digits)} м`
}
