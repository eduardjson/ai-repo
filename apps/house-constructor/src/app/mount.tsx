import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Provider } from 'react-redux'
import { enableShadowDOM } from 'react-stately/private/flags/flags'

import { setPortalContainer } from '@/shared/lib/portal-container'

import { App } from './App'
import { store } from './store'
import { injectStyles } from './styles'

// React Aria (а HeroUI построен поверх неё) по умолчанию не умеет обрабатывать
// события, пересекающие границу shadow root: `usePress` и другие хуки используют
// `getEventTarget`/`nodeContains`, которые без этого флага не «видят» сквозь
// shadow boundary (см. adobe/react-spectrum#8864). В результате клики по Switch,
// Tabs и т.п. внутри shadow root не срабатывают. Флаг глобальный — включаем один
// раз при загрузке модуля, до монтирования React-дерева.
enableShadowDOM()

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
  //
  // Внутри shadow root нет `:root`, поэтому HeroUI-тема (светлая палитра) не
  // применяется сама по себе: её переменные (`--default`, `--foreground`,
  // `--background`, `--surface` и т.д.) объявлены под селекторами
  // `:root, .light, [data-theme="light"], …, :host(.light), …` — без «голого»
  // `:host`. Без этого Switch, NumberField и прочие компоненты не получают цветов
  // (у Switch трек становится прозрачным). Задаём тему явно на обоих хостах;
  // portalHost нужен отдельно — оверлеи (Select.Popover) рендерятся в него
  // и не наследуют тему от appHost.
  const appHost = document.createElement('div')
  appHost.style.height = '100%'
  appHost.dataset.theme = 'light'
  shadow.appendChild(appHost)

  const portalHost = document.createElement('div')
  portalHost.setAttribute('data-portal', '')
  portalHost.dataset.theme = 'light'
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
