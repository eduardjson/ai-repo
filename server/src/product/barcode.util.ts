/**
 * Утилиты для работы со штрихкодами и артикулами номенклатуры.
 *
 * EAN-13 — стандарт розничного штрихкода (GTIN). Генерируем валидный номер
 * с контрольной цифрой. Для внутренних этикеток на мерный товар (доски,
 * арматура) клиент может использовать CODE128 — это просто произвольная строка.
 */

/** Считает контрольную цифру EAN-13 по первым 12 цифрам. */
export function ean13CheckDigit(first12: string): number {
  if (!/^\d{12}$/.test(first12)) {
    throw new Error('EAN-13: первые 12 символов должны быть цифрами');
  }
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = Number(first12[i]);
    // Нечётная позиция (1-based) → вес 1, чётная → вес 3.
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return check;
}

/** Формирует полный EAN-13 из 12 цифр + контрольная цифра. */
export function ean13From12(first12: string): string {
  return first12 + String(ean13CheckDigit(first12));
}

/** Проверяет, валиден ли EAN-13 (12 или 13 цифр + контрольная). */
export function isValidEan13(value: string): boolean {
  if (!/^\d{13}$/.test(value)) return false;
  return ean13CheckDigit(value.slice(0, 12)) === Number(value[12]);
}

/**
 * Генерирует уникальный внутренний EAN-13 на основе короткого числового ключа
 * (например, порядкового номера). Префикс `20` — «внутренний» диапазон EAN.
 */
export function generateInternalEan13(seq: number): string {
  const base = `20${String(seq % 10000000000).padStart(10, '0')}`;
  return ean13From12(base);
}

/** Генерирует артикул (SKU) из человекочитаемого префикса и порядкового номера. */
export function generateSku(prefix: string, seq: number): string {
  const clean = prefix.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6) || 'ART';
  return `${clean}-${String(seq).padStart(6, '0')}`;
}
