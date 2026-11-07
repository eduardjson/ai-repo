import { mountApp } from '@/app/mount'

/**
 * Пропсы монтирования (расширяются по мере необходимости).
 * Пока пустые: конструктор самодостаточен и не требует данных от хоста.
 */
export interface MountOptions {
  // например: token, apiBaseUrl, themeMode — если появится интеграция с API
}

/**
 * Точка входа remote-приложения для хоста (Module Federation).
 *
 * Монтирует конструктор в переданный DOM-контейнер через shadow root, создавая
 * собственный React-root со своим Redux-стором и изолированными стилями. Ни
 * React, ни стор, ни стили не зависят от хоста — это позволяет remote
 * использовать свой стек (React 19.3, HeroUI, Tailwind, R3F) и поддерживаться
 * отдельной командой.
 *
 * Возвращает функцию размонтирования, которую хост вызывает при уходе с вкладки.
 */
export function mount(container: HTMLElement, _options?: MountOptions): () => void {
  return mountApp(container)
}
