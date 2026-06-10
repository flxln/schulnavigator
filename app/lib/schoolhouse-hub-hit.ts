import type { HubFrame } from '@/lib/schoolhouse-hub-map'

const HIT_PAD_VB = 0.5

function rangesOverlap(
  a0: number,
  a1: number,
  b0: number,
  b1: number,
): boolean {
  return a0 < b1 && b0 < a1
}

/** Rechteck-Rechteck-Überlappung in viewBox-Koordinaten. */
export function hitRectsOverlap(a: HubFrame, b: HubFrame): boolean {
  const [ax, ay, aw, ah] = a
  const [bx, by, bw, bh] = b
  return rangesOverlap(ax, ax + aw, bx, bx + bw) && rangesOverlap(ay, ay + ah, by, by + bh)
}

/**
 * Expandiert ein Slot-Rechteck Richtung minCssPx Touch-Zielgröße,
 * klemmt aber auf höchstens halben Abstand zum nächsten Nachbarn (keine Überlappung).
 */
export function expandHitRect(
  frame: HubFrame,
  neighbors: readonly HubFrame[],
  pxPerUnit: number,
  minCssPx = 44,
): HubFrame {
  const [x, y, w, h] = frame
  const minVb = minCssPx / Math.max(pxPerUnit, 1e-6)
  const cx = x + w / 2
  const cy = y + h / 2
  const halfW = Math.max(w, minVb) / 2
  const halfH = Math.max(h, minVb) / 2

  let left = cx - halfW
  let right = cx + halfW
  let top = cy - halfH
  let bottom = cy + halfH

  for (const [nx, ny, nw, nh] of neighbors) {
    const nRight = nx + nw
    const nBottom = ny + nh

    if (nx >= x + w - 1 && rangesOverlap(y, y + h, ny, nBottom)) {
      const gap = nx - (x + w)
      if (gap >= 0) {
        right = Math.min(right, x + w + gap / 2 - HIT_PAD_VB)
      }
    }
    if (nRight <= x + 1 && rangesOverlap(y, y + h, ny, nBottom)) {
      const gap = x - nRight
      if (gap >= 0) {
        left = Math.max(left, x - gap / 2 + HIT_PAD_VB)
      }
    }
    if (ny >= y + h - 1 && rangesOverlap(x, x + w, nx, nRight)) {
      const gap = ny - (y + h)
      if (gap >= 0) {
        bottom = Math.min(bottom, y + h + gap / 2 - HIT_PAD_VB)
      }
    }
    if (nBottom <= y + 1 && rangesOverlap(x, x + w, nx, nRight)) {
      const gap = y - nBottom
      if (gap >= 0) {
        top = Math.max(top, y - gap / 2 + HIT_PAD_VB)
      }
    }
  }

  left = Math.min(left, x)
  right = Math.max(right, x + w)
  top = Math.min(top, y)
  bottom = Math.max(bottom, y + h)

  return [left, top, right - left, bottom - top]
}
