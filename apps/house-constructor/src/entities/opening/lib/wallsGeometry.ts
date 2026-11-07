import type { BuildingDims } from '@/entities/building'
import { createId } from '@/shared/lib/id'

import type { BoxSpec } from '@/entities/layer'
import type { Opening, OpeningType, WallIndex } from '../model/types'
import { wallFrame, wallLength } from './walls'

export interface OpeningVisual {
  openingId: string
  type: OpeningType
  wall: WallIndex
  box: BoxSpec
}

export interface WallsGeometry {
  /** Сплошные участки стен (с вырезами под проёмы). */
  segments: BoxSpec[]
  /** Визуализация проёмов (стекло/дверное полотно). */
  openings: OpeningVisual[]
}

const WINDOW_COLOR = '#a9d5f2'
const DOOR_COLOR = '#6b4f34'

/** Локальный бокс в координатах стены (u вдоль, y вверх) → мировые координаты. */
function toWorldBox(
  frame: ReturnType<typeof wallFrame>,
  u: number,
  y: number,
  usize: number,
  ysize: number,
  thickness: number,
  baseY: number,
  color: string,
  id: string,
  opacity?: number,
): BoxSpec {
  const cy = baseY + y
  if (frame.alongAxis === 'x') {
    return {
      id,
      position: [frame.startX + u, cy, frame.centerZ],
      size: [usize, ysize, thickness],
      color,
      opacity,
    }
  }
  return {
    id,
    position: [frame.centerX, cy, frame.startZ + u],
    size: [thickness, ysize, usize],
    color,
    opacity,
  }
}

/**
 * Генерирует геометрию стен первого этажа с проёмами:
 * стена делится на перемычки/подоконные/простеночные участки,
 * а проёмы отображаются стеклом (окна) или полотном (двери).
 */
export function generateWalls(
  dims: BuildingDims,
  params: Record<string, number>,
  openings: Opening[],
  baseY: number,
  wallColor: string,
): WallsGeometry {
  const thickness = params.thickness ?? 0.3
  const height = params.height ?? 3.0

  const segments: BoxSpec[] = []
  const visuals: OpeningVisual[] = []

  for (const wall of [0, 1, 2, 3] as const) {
    const length = wallLength(dims, wall)
    const frame = wallFrame(dims, wall, thickness)
    const wallOpenings = openings
      .filter((opening) => opening.wall === wall)
      .sort((a, b) => a.position - b.position)

    const boxes: { u: number; y: number; usize: number; ysize: number }[] = []

    let cursor = 0
    for (const opening of wallOpenings) {
      const left = opening.position - opening.width / 2
      const right = opening.position + opening.width / 2

      if (left - cursor > 1e-6) {
        boxes.push({ u: cursor + (left - cursor) / 2, y: height / 2, usize: left - cursor, ysize: height })
      }

      const sill = opening.type === 'door' ? 0 : opening.sill
      if (sill > 1e-6) {
        boxes.push({ u: opening.position, y: sill / 2, usize: opening.width, ysize: sill })
      }

      const top = sill + opening.height
      if (height - top > 1e-6) {
        boxes.push({ u: opening.position, y: top + (height - top) / 2, usize: opening.width, ysize: height - top })
      }

      cursor = right
    }
    if (length - cursor > 1e-6) {
      boxes.push({ u: cursor + (length - cursor) / 2, y: height / 2, usize: length - cursor, ysize: height })
    }

    for (const box of boxes) {
      segments.push(
        toWorldBox(
          frame,
          box.u,
          box.y,
          box.usize,
          box.ysize,
          thickness,
          baseY,
          wallColor,
          createId(`wall-${wall}`),
        ),
      )
    }

    for (const opening of wallOpenings) {
      const sill = opening.type === 'door' ? 0 : opening.sill
      const yCenter = sill + opening.height / 2
      const isWindow = opening.type === 'window'
      const color = isWindow ? WINDOW_COLOR : DOOR_COLOR
      const opacity = isWindow ? 0.6 : undefined
      const visualThickness = isWindow ? Math.max(0.04, thickness * 0.8) : Math.max(0.08, thickness + 0.04)

      visuals.push({
        openingId: opening.id,
        type: opening.type,
        wall,
        box: toWorldBox(
          frame,
          opening.position,
          yCenter,
          opening.width,
          opening.height,
          visualThickness,
          baseY,
          color,
          opening.id,
          opacity,
        ),
      })
    }
  }

  return { segments, openings: visuals }
}
