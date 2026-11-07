import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Provider } from 'react-redux'

import { setPortalContainer } from '@/shared/lib/portal-container'

import { App } from './App'
import { store } from './store'
import { injectStyles } from './styles'

/**
 * Монтирует приложение в контейнер, оборачивая его в shadow root.
 *
 * Shadow DOM полностью изолирует стили: CSS хоста не проникает внутрь remote,
 * а CSS remote (Tailwind preflight, утилиты, HeroUI) не «протекает» в хост.
 * Возвращает функцию размонтирования.
 */
export function mountApp(container: HTMLElement): () => void {
  // Переиспользуем уже существующий shadow root (например, при повторном
  // монтировании в StrictMode) и очищаем его содержимое.
  const shadow = container.shadowRoot ?? container.attachShadow({ mode: 'open' })
  shadow.replaceChildren()

  injectStyles(shadow)

  // React рендерится в appHost; оверлеи HeroUI — в отдельный portalHost,
  // чтобы они тоже оставались внутри shadow root и получали изолированные стили.
  const appHost = document.createElement('div')
  appHost.style.height = '100%'
  shadow.appendChild(appHost)

  const portalHost = document.createElement('div')
  portalHost.setAttribute('data-portal', '')
  shadow.appendChild(portalHost)
  setPortalContainer(portalHost)

  const root: Root = createRoot(appHost)
  root.render(
    <StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </StrictMode>,
  )

  return () => {
    root.unmount()
    setPortalContainer(null)
    shadow.replaceChildren()
  }
}
