import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import { App } from '@/app'
import { store } from '@/app/store'

// Standalone-базовые стили (html/body/#root, скроллбар и т.п.). Подключаются
// только здесь — при монтировании в хост через Module Federation не грузятся,
// чтобы не перебивать стили хоста.
import '@/app/styles/base.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
