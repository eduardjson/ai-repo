/**
 * Единая точка сбора CSS remote-приложения.
 *
 * Все стили импортируются как строки через `?inline` и встраиваются внутрь
 * shadow root (см. app/mount.tsx), а не в <head> документа. Это полностью
 * изолирует стили remote от стилей хоста (и наоборот) при встраивании через
 * Module Federation.
 *
 * Порядок важен: сначала global.css (Tailwind + HeroUI + CSS-переменные),
 * затем CSS страниц/виджетов — обычные «бесслойные» классы, которые должны
 * перебивать стили HeroUI из @layer components.
 */

import globalCss from './global.css?inline'

import builderPageCss from '@/pages/builder/ui/BuilderPage.css?inline'
import toolbarCss from '@/widgets/toolbar/ui/Toolbar.css?inline'
import layerPanelCss from '@/widgets/layer-panel/ui/LayerPanel.css?inline'
import propertiesPanelCss from '@/widgets/properties-panel/ui/PropertiesPanel.css?inline'
import viewportCss from '@/widgets/viewport/ui/Viewport.css?inline'
import jumperMenuCss from '@/widgets/viewport/ui/JumperMenu.css?inline'

const STYLES = [
  globalCss,
  builderPageCss,
  toolbarCss,
  layerPanelCss,
  propertiesPanelCss,
  viewportCss,
  jumperMenuCss,
].join('\n')

/** Вставляет стили remote в указанный shadow root. */
export function injectStyles(shadow: ShadowRoot): void {
  const style = document.createElement('style')
  style.textContent = STYLES
  shadow.appendChild(style)
}
