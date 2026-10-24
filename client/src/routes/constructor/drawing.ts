import { jsPDF } from 'jspdf'
import { ROOF_MATERIALS, WALL_TYPES, FOUNDATIONS, getOption } from './config'
import type { ModuleConfig } from './estimate'

// ── Page (A4 landscape) in millimetres ──────────────────────────────────────
const PAGE_W = 297
const PAGE_H = 210
const M = 15 // page margin
const DIM = 14 // dimension band
const GAP = 10 // gap between views

const FONT = 'Arial, Helvetica, sans-serif'

const n = (x: number) => Math.round(x * 100) / 100

/** Форматирование размера: «6», «3», «2,5» (метры). */
export const fmtDim = (m: number) => (Number.isInteger(m) ? `${m}` : m.toFixed(1).replace('.', ','))

interface Openings {
  windows: { x: number }[]
  doors: { x: number }[]
}

function getOpenings(cfg: ModuleConfig): Openings {
  const { length, windows, doors } = cfg
  const ws = Array.from({ length: windows }, (_, i) => ({
    x: -length / 2 + (length * (i + 1)) / (windows + 1),
  }))
  const ds = Array.from({ length: doors }, (_, i) => ({
    x: length / 2 - 0.6 - i * 1.2,
  }))
  return { windows: ws, doors: ds }
}

function roofRise(cfg: ModuleConfig): number {
  return cfg.roofType === 'gable' ? Math.max(0.8, cfg.width * 0.4) : 0
}

const standardScale = (S: number) => {
  const actual = 1000 / S
  return [10, 20, 25, 50, 100].find((x) => x >= actual) ?? 100
}

// ── SVG string builder ──────────────────────────────────────────────────────
export function buildDrawingSvg(cfg: ModuleConfig): string {
  const { length: L, width: W, height: H, roofType } = cfg
  const roofH = roofRise(cfg)
  const open = getOpenings(cfg)

  // scale (mm per metre) so all views fit
  const availW = PAGE_W - 2 * M - 2 * DIM - GAP
  const availH = PAGE_H - 2 * M - 2 * DIM - GAP
  const hScale = availW / (L + W)
  const vScale = availH / (H + roofH + W)
  const S = Math.max(5, Math.min(hScale, vScale, 40))

  const elevH = (H + roofH) * S // ridge→floor height of elevations
  const eaveMM = roofH * S
  const wallMM = H * S

  // view origins (y grows downward, matching SVG & jsPDF)
  const frontOx = M + DIM
  const frontOy = M
  const sideOx = frontOx + L * S + GAP + DIM
  const sideOy = M
  const planOx = M + DIM
  const planOy = M + elevH + GAP + DIM
  const stampOx = planOx + L * S + GAP
  const stampOy = planOy
  const stampW = PAGE_W - M - stampOx

  const parts: string[] = []

  // ── helpers ────────────────────────────────────────────────────────────────
  const line = (x1: number, y1: number, x2: number, y2: number, opts: { stroke?: string; lw?: number; dash?: string } = {}) =>
    `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${opts.stroke ?? '#1a1a1a'}" stroke-width="${opts.lw ?? 0.25}"${opts.dash ? ` stroke-dasharray="${opts.dash}"` : ''} />`

  const rect = (x: number, y: number, w: number, h: number, opts: { stroke?: string; fill?: string; lw?: number; dash?: string } = {}) =>
    `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${opts.fill ?? 'none'}" stroke="${opts.stroke ?? '#1a1a1a'}" stroke-width="${opts.lw ?? 0.25}"${opts.dash ? ` stroke-dasharray="${opts.dash}"` : ''} />`

  const poly = (pts: [number, number][], opts: { stroke?: string; fill?: string; lw?: number } = {}) =>
    `<polygon points="${pts.map(([x, y]) => `${n(x)},${n(y)}`).join(' ')}" fill="${opts.fill ?? 'none'}" stroke="${opts.stroke ?? '#1a1a1a'}" stroke-width="${opts.lw ?? 0.25}" />`

  const text = (x: number, y: number, str: string, fs = 3, anchor: 'start' | 'middle' | 'end' = 'middle', bold = false) =>
    `<text x="${n(x)}" y="${n(y)}" font-family="${FONT}" font-size="${fs}" text-anchor="${anchor}" font-weight="${bold ? '700' : '400'}" fill="#1a1a1a">${str}</text>`

  // dimension line (horizontal): between x1..x2 at y, text above
  const hDim = (x1: number, x2: number, y: number, label: string) => {
    parts.push(line(x1, y, x2, y, { lw: 0.2 }))
    parts.push(line(x1, y - 1.4, x1, y + 1.4, { lw: 0.2 }))
    parts.push(line(x2, y - 1.4, x2, y + 1.4, { lw: 0.2 }))
    parts.push(text((x1 + x2) / 2, y - 2, label, 2.8))
  }

  // dimension line (vertical): between y1..y2 at x, text on the left (rotated)
  const vDim = (y1: number, y2: number, x: number, label: string) => {
    parts.push(line(x, y1, x, y2, { lw: 0.2 }))
    parts.push(line(x - 1.4, y1, x + 1.4, y1, { lw: 0.2 }))
    parts.push(line(x - 1.4, y2, x + 1.4, y2, { lw: 0.2 }))
    parts.push(`<text x="${n(x - 2)}" y="${n((y1 + y2) / 2)}" font-family="${FONT}" font-size="2.8" text-anchor="end" fill="#1a1a1a" transform="rotate(-90 ${n(x - 2)} ${n((y1 + y2) / 2)})">${label}</text>`)
  }

  // ── Фасад (front elevation, long side) ────────────────────────────────────
  const fEaveY = frontOy + eaveMM
  const fFloorY = frontOy + elevH
  // roof slope band (gable) or thin roof slab (flat)
  if (roofType === 'gable') {
    parts.push(rect(frontOx - 0.12 * S, frontOy, L * S + 0.24 * S, eaveMM, { lw: 0.3 }))
    parts.push(line(frontOx - 0.12 * S, fEaveY, frontOx + L * S + 0.12 * S, fEaveY, { lw: 0.25 }))
  } else {
    parts.push(rect(frontOx - 0.12 * S, frontOy, L * S + 0.24 * S, 0.15 * S, { lw: 0.3 }))
  }
  // wall
  parts.push(rect(frontOx, fEaveY, L * S, wallMM, { lw: 0.35 }))
  // windows
  const winSill = H * 0.6 - 0.5
  const winH = 1.0
  const winW = 0.9
  for (const w of open.windows) {
    const x = frontOx + (w.x + L / 2) * S
    const y = fEaveY + (H - (winSill + winH)) * S
    parts.push(rect(x - (winW / 2) * S, y, winW * S, winH * S, { lw: 0.25 }))
  }
  // doors
  const doorW = 0.9
  const doorH = 2.1
  for (const d of open.doors) {
    const x = frontOx + (d.x + L / 2) * S
    parts.push(rect(x - (doorW / 2) * S, fFloorY - doorH * S, doorW * S, doorH * S, { lw: 0.25 }))
  }
  // dimensions
  hDim(frontOx, frontOx + L * S, fFloorY + 7, `${fmtDim(L)} м`)
  vDim(fEaveY, fFloorY, frontOx - 7, `${fmtDim(H)} м`)
  parts.push(text(frontOx + (L * S) / 2, frontOy - 4, 'Фасад (длинная сторона)', 3.4, 'middle', true))

  // ── Боковой вид (side elevation, gable end) ───────────────────────────────
  const sEaveY = sideOy + eaveMM
  const sFloorY = sideOy + elevH
  if (roofType === 'gable') {
    parts.push(poly([
      [sideOx, sEaveY],
      [sideOx + (W * S) / 2, sideOy],
      [sideOx + W * S, sEaveY],
    ], { lw: 0.3 }))
  } else {
    parts.push(rect(sideOx - 0.12 * S, sideOy, W * S + 0.24 * S, 0.15 * S, { lw: 0.3 }))
  }
  parts.push(rect(sideOx, sEaveY, W * S, wallMM, { lw: 0.35 }))
  hDim(sideOx, sideOx + W * S, sFloorY + 7, `${fmtDim(W)} м`)
  vDim(sEaveY, sFloorY, sideOx - 7, `${fmtDim(H)} м`)
  parts.push(text(sideOx + (W * S) / 2, sideOy - 4, 'Боковой фасад', 3.4, 'middle', true))

  // ── План (top view) ───────────────────────────────────────────────────────
  const WT = 3 // visual wall thickness (mm)
  const pBottom = planOy + W * S
  parts.push(rect(planOx, planOy, L * S, W * S, { lw: 0.4 }))
  parts.push(rect(planOx + WT, planOy + WT, L * S - 2 * WT, W * S - 2 * WT, { lw: 0.2 }))
  // openings on the front (bottom) wall
  for (const w of open.windows) {
    const x = planOx + (w.x + L / 2) * S
    parts.push(rect(x - (winW / 2) * S, pBottom - WT, winW * S, WT, { fill: '#ffffff', lw: 0.2 }))
    parts.push(line(x - (winW / 2) * S, pBottom - WT / 2, x + (winW / 2) * S, pBottom - WT / 2, { lw: 0.15 }))
  }
  for (const d of open.doors) {
    const x = planOx + (d.x + L / 2) * S
    // opening (gap)
    parts.push(rect(x - (doorW / 2) * S, pBottom - WT, doorW * S, WT, { fill: '#ffffff', lw: 0.2 }))
    // door leaf + swing arc
    parts.push(line(x - (doorW / 2) * S, pBottom - WT, x - (doorW / 2) * S, pBottom - WT - doorW * S, { lw: 0.2 }))
    parts.push(`<path d="M ${n(x - (doorW / 2) * S)} ${n(pBottom - WT - doorW * S)} A ${n(doorW * S)} ${n(doorW * S)} 0 0 1 ${n(x + (doorW / 2) * S)} ${n(pBottom - WT)}" fill="none" stroke="#1a1a1a" stroke-width="0.2" />`)
  }
  // partitions
  for (let i = 0; i < cfg.partitions; i++) {
    const x = planOx + (((i + 1) / (cfg.partitions + 1)) * L) * S
    parts.push(line(x, planOy + WT, x, pBottom - WT, { lw: 0.2, dash: '2,1.5' }))
  }
  // dimensions
  hDim(planOx, planOx + L * S, pBottom + 7, `${fmtDim(L)} м`)
  vDim(planOy, pBottom, planOx - 7, `${fmtDim(W)} м`)
  parts.push(text(planOx + (L * S) / 2, planOy - 4, 'План', 3.4, 'middle', true))

  // ── Штамп (title block) ───────────────────────────────────────────────────
  const stampH = 40
  parts.push(rect(stampOx, stampOy, stampW, stampH, { lw: 0.4 }))
  parts.push(line(stampOx, stampOy + stampH * 0.42, stampOx + stampW, stampOy + stampH * 0.42, { lw: 0.25 }))
  parts.push(text(stampOx + stampW / 2, stampOy + 7, 'ЖИЛОЙ МОДУЛЬ', 4.2, 'middle', true))
  parts.push(text(stampOx + stampW / 2, stampOy + 12, `Габариты: ${fmtDim(L)} × ${fmtDim(W)} × ${fmtDim(H)} м`, 3.2, 'middle'))

  const wall = getOption(WALL_TYPES, cfg.wallType)
  const roof = getOption(ROOF_MATERIALS, cfg.roofMaterial)
  const foundation = getOption(FOUNDATIONS, cfg.foundation)
  const line1 = `Стены: ${wall.label} · Кровля: ${roof.label} · ${roofType === 'gable' ? 'двускатная' : 'плоская'}`
  const line2 = `Фундамент: ${foundation.label} · Окна: ${cfg.windows} · Двери: ${cfg.doors} · Перегородки: ${cfg.partitions}`
  parts.push(text(stampOx + 4, stampOy + stampH * 0.42 + 8, line1, 2.7, 'start'))
  parts.push(text(stampOx + 4, stampOy + stampH * 0.42 + 13, line2, 2.7, 'start'))
  parts.push(text(stampOx + 4, stampOy + stampH * 0.42 + 18, `Масштаб: 1:${standardScale(S)}`, 2.7, 'start'))
  parts.push(text(stampOx + stampW - 4, stampOy + stampH - 4, 'Лист 1 / 1', 2.7, 'end'))

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${PAGE_W}" height="${PAGE_H}" viewBox="0 0 ${PAGE_W} ${PAGE_H}" shape-rendering="geometricPrecision">`,
    `<rect width="${PAGE_W}" height="${PAGE_H}" fill="#ffffff" />`,
    ...parts,
    `</svg>`,
  ].join('')
}

// ── PDF export (rasterises the SVG via the browser for correct Cyrillic) ────
function svgToImage(svg: string, w: number, h: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.width = w
    img.height = h
    img.src = url
  })
}

export async function exportDrawingPdf(cfg: ModuleConfig) {
  const svg = buildDrawingSvg(cfg)
  const img = await svgToImage(svg, PAGE_W, PAGE_H)

  const scale = 4
  const canvas = document.createElement('canvas')
  canvas.width = PAGE_W * scale
  canvas.height = PAGE_H * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D unavailable')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, PAGE_W, PAGE_H)
  doc.save('chertyozh-modulya.pdf')
}
