import {
  type HotspotYBand,
  viewportYFromImageY,
  visibleYNormalRange,
} from '@/lib/raum-viewer/clip-zone'
import { MIN_PAN_DISPLAY_RATIO } from '@/lib/raum-viewer/constants'

export type ImageRect = {
  left: number
  top: number
  width: number
  height: number
}

export function objectFitContainImageRect(
  containerW: number,
  containerH: number,
  naturalW: number,
  naturalH: number,
): ImageRect | null {
  if (containerW <= 0 || containerH <= 0 || naturalW <= 0 || naturalH <= 0) {
    return null
  }
  const scale = Math.min(containerW / naturalW, containerH / naturalH)
  const width = naturalW * scale
  const height = naturalH * scale
  return {
    left: (containerW - width) / 2,
    top: (containerH - height) / 2,
    width,
    height,
  }
}

export function hotspotYBandForCalib(
  naturalW: number,
  naturalH: number,
  containerW: number,
  containerH: number,
): HotspotYBand {
  if (naturalW <= 0 || naturalH <= 0 || containerW <= 0 || containerH <= 0) {
    return { yMin: 0, yMax: 1 }
  }
  return visibleYNormalRange(
    naturalW / naturalH,
    containerW,
    containerH,
    MIN_PAN_DISPLAY_RATIO,
  )
}

function roundNorm(v: number): number {
  return Math.round(Math.min(1, Math.max(0, v)) * 10_000) / 10_000
}

export function flatCalibFromImageClick(input: {
  clientX: number
  clientY: number
  imageRect: ImageRect
  yBand: HotspotYBand
}): { x: number; y: number } | null {
  const { clientX, clientY, imageRect, yBand } = input
  if (imageRect.width <= 0 || imageRect.height <= 0) {
    return null
  }
  const localX = clientX - imageRect.left
  const localY = clientY - imageRect.top
  if (
    localX < 0 ||
    localY < 0 ||
    localX > imageRect.width ||
    localY > imageRect.height
  ) {
    return null
  }
  const imageX = localX / imageRect.width
  const imageY = localY / imageRect.height
  return {
    x: roundNorm(imageX),
    y: roundNorm(viewportYFromImageY(imageY, yBand)),
  }
}
