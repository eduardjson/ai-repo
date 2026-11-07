/**
 * Глобальная ссылка на DOM-контейнер для оверлеев HeroUI (Select.Popover и т.п.).
 *
 * HeroUI (react-aria-components) по умолчанию рендерит попапы через
 * `createPortal(document.body)`. При монтировании приложения в shadow root это
 * выносит оверлеи наружу из изоляции — и они теряют стили. Поэтому контейнер
 * для порталов создаётся внутри shadow root и сохраняется здесь, а компоненты
 * передают его в `UNSTABLE_portalContainer`.
 */

let portalContainer: HTMLElement | null = null

export function setPortalContainer(element: HTMLElement | null): void {
  portalContainer = element
}

export function getPortalContainer(): HTMLElement | null {
  return portalContainer
}
