import type { BuildingDims } from '@/entities/building'

import type { WallIndex } from '../model/types'

/**
 * Геометрия стен периметра: система координат каждой стены,
 * преобразования «мир ↔ локальная координата вдоль стены».
 */
export interface WallFrame {
  index: WallIndex
  /** Длина стены (м). */
  length: number
  /** Точка начала стены (угол, u = 0). */
  startX: number
  startZ: number
  /** Единичный вектор направления вдоль стены. */
  dirX: number
  dirZ: number
  alongAxis: 'x' | 'z'
  /** Центральная линия стены (с учётом толщины). */
  centerX: number
  centerZ: number
}

export function wallLength(dims: BuildingDims, wall: WallIndex): number {
  return wall === 0 || wall === 2 ? dims.length : dims.width
}

export function wallFrame(dims: BuildingDims, wall: WallIndex, thickness: number): WallFrame {
  const L = dims.length
  const W = dims.width
  const t = thickness

  switch (wall) {
    case 0:
      return {
        index: 0,
        length: L,
        startX: -L / 2,
        startZ: W / 2,
        dirX: 1,
        dirZ: 0,
        alongAxis: 'x',
        centerX: 0,
        centerZ: W / 2 - t / 2,
      }
    case 2:
      return {
        index: 2,
        length: L,
        startX: -L / 2,
        startZ: -W / 2,
        dirX: 1,
        dirZ: 0,
        alongAxis: 'x',
        centerX: 0,
        centerZ: -(W / 2 - t / 2),
      }
    case 1:
      return {
        index: 1,
        length: W,
        startX: L / 2,
        startZ: -W / 2,
        dirX: 0,
        dirZ: 1,
        alongAxis: 'z',
        centerX: L / 2 - t / 2,
        centerZ: 0,
      }
    case 3:
      return {
        index: 3,
        length: W,
        startX: -L / 2,
        startZ: -W / 2,
        dirX: 0,
        dirZ: 1,
        alongAxis: 'z',
        centerX: -(L / 2 - t / 2),
        centerZ: 0,
      }
  }
}

/** Переводит мировую точку XZ в локальную координату u вдоль стены. */
export function worldToWallLocal(
  dims: BuildingDims,
  wall: WallIndex,
  x: number,
  z: number,
): number {
  const frame = wallFrame(dims, wall, 0)
  return (x - frame.startX) * frame.dirX + (z - frame.startZ) * frame.dirZ
}
