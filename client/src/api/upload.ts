import { getAccessToken } from './base'

/**
 * Ручная отправка multipart/form-data для эндпоинтов загрузки файлов
 * (изображение товара, PDF-вложение в чате). Сгенерированный клиент такие
 * эндпоинты не покрывает, т.к. OpenAPI-спек описывает их тело как JSON.
 */
export async function uploadFormData<T = unknown>(
  url: string,
  method: 'POST' | 'PATCH' | 'PUT',
  formData: FormData,
): Promise<T> {
  const res = await fetch(`/api${url}`, {
    method,
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    body: formData,
    credentials: 'include',
  })
  if (!res.ok) {
    let payload: unknown
    try {
      payload = await res.json()
    } catch {
      /* ignore */
    }
    throw Object.assign(new Error(`HTTP ${res.status}`), { data: payload })
  }
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}
