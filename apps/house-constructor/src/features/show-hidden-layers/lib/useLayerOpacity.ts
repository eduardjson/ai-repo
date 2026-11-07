import { useAppSelector } from '@/app/hooks'
import type { LayerType } from '@/entities/layer'

export const GHOST_OPACITY = 0.3

/**
 * Итоговая непрозрачность слоя:
 * 1 — слой включён, 0.3 — скрытый слой в режиме «полупрозрачно», 0 — не отображается.
 */
export function useLayerOpacity(layer: LayerType): number {
  const visible = useAppSelector((state) => state.layer.visible[layer])
  const ghostEnabled = useAppSelector((state) => state.showHidden.enabled)

  return visible ? 1 : ghostEnabled ? GHOST_OPACITY : 0
}
