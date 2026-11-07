import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Provider } from 'react-redux'

import { App, store } from '@/app'

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
 * Монтирует конструктор в переданный DOM-контейнер, создавая собственный
 * React-root со своим Redux-стором. Ни React, ни стор, ни стили не зависят от
 * хоста — это позволяет remote использовать свой стек (React 19.3, HeroUI,
 * Tailwind, R3F) и поддерживаться отдельной командой.
 *
 * Возвращает функцию размонтирования, которую хост вызывает при уходе с вкладки.
 */
export function mount(container: HTMLElement, _options?: MountOptions): () => void {
  const root: Root = createRoot(container)

  root.render(
    <StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </StrictMode>,
  )

  return () => root.unmount()
}
