import {
  createMpzContentIo,
  type MpzContentIo,
  withMpzWriteLock,
} from '@/lib/mpz-content-io'
import { HUB_SLUG_MAP } from '@/lib/schoolhouse-hub-map'
import {
  normalizeYawDeg,
  roundDeg,
} from '@/lib/raum-viewer/sphere-marker-conventions'
import type { Station, StationsFile, ViewerMode } from '@/lib/types'

const HUB_SLUGS = new Set(Object.keys(HUB_SLUG_MAP))

export type MpzHotspotCalibErrorCode = 'VALIDATION' | 'IO'

export class MpzHotspotCalibError extends Error {
  readonly code: MpzHotspotCalibErrorCode

  constructor(code: MpzHotspotCalibErrorCode, message: string) {
    super(message)
    this.name = 'MpzHotspotCalibError'
    this.code = code
  }
}

function roundNorm(v: number): number {
  return Math.round(Math.min(1, Math.max(0, v)) * 10_000) / 10_000
}

function clampPitch(deg: number): number {
  return roundDeg(Math.min(90, Math.max(-90, deg)))
}

function resolveViewer(station: Station): ViewerMode {
  return station.viewer ?? 'flat'
}

function findStation(data: StationsFile, slug: string): Station {
  const station = data.stations.find((s) => s.slug === slug)
  if (!station) {
    throw new MpzHotspotCalibError('VALIDATION', `Station "${slug}" nicht gefunden.`)
  }
  return station
}

export async function applyFlatHotspotCoords(
  input: { slug: string; hotspotId: string; x: number; y: number },
  io: MpzContentIo = createMpzContentIo(),
): Promise<{ hotspotId: string; x: number; y: number }> {
  return withMpzWriteLock(async () => {
    if (!HUB_SLUGS.has(input.slug)) {
      throw new MpzHotspotCalibError('VALIDATION', `Unbekannter slug "${input.slug}".`)
    }
    if (!Number.isFinite(input.x) || !Number.isFinite(input.y)) {
      throw new MpzHotspotCalibError('VALIDATION', 'x und y müssen Zahlen sein.')
    }

    const x = roundNorm(input.x)
    const y = roundNorm(input.y)
    const data = await io.readStations()
    const station = findStation(data, input.slug)
    const viewer = resolveViewer(station)
    if (viewer === 'equirectangular') {
      throw new MpzHotspotCalibError(
        'VALIDATION',
        `Station "${input.slug}" ist kein Flat-Viewer — Sphere-Kalibrierung nutzen.`,
      )
    }

    const hotspots = station.hotspots
    if (!hotspots?.length) {
      throw new MpzHotspotCalibError(
        'VALIDATION',
        `Station "${input.slug}" hat keine hotspots[].`,
      )
    }

    const index = hotspots.findIndex((h) => h.id === input.hotspotId)
    if (index < 0) {
      throw new MpzHotspotCalibError(
        'VALIDATION',
        `Hotspot "${input.hotspotId}" nicht gefunden.`,
      )
    }

    const nextHotspots = hotspots.map((h, i) =>
      i === index ? { ...h, x, y } : h,
    )
    const nextStations = data.stations.map((s) =>
      s.slug === input.slug ? { ...s, hotspots: nextHotspots } : s,
    )

    await io.writeStations(
      { stations: nextStations },
      { strict: true, validateAssets: false },
    )

    return { hotspotId: input.hotspotId, x, y }
  })
}

export async function applySphereHotspotCoords(
  input: { slug: string; hotspotId: string; yaw: number; pitch: number },
  io: MpzContentIo = createMpzContentIo(),
): Promise<{ hotspotId: string; yaw: number; pitch: number }> {
  return withMpzWriteLock(async () => {
    if (!HUB_SLUGS.has(input.slug)) {
      throw new MpzHotspotCalibError('VALIDATION', `Unbekannter slug "${input.slug}".`)
    }
    if (
      !Number.isFinite(input.yaw) ||
      !Number.isFinite(input.pitch)
    ) {
      throw new MpzHotspotCalibError('VALIDATION', 'yaw und pitch müssen Zahlen sein.')
    }

    const yaw = normalizeYawDeg(input.yaw)
    const pitch = clampPitch(input.pitch)
    const data = await io.readStations()
    const station = findStation(data, input.slug)
    const viewer = resolveViewer(station)
    if (viewer !== 'equirectangular') {
      throw new MpzHotspotCalibError(
        'VALIDATION',
        `Station "${input.slug}" ist kein Sphere-Viewer.`,
      )
    }

    const hotspots360 = station.hotspots360
    if (!hotspots360?.length) {
      throw new MpzHotspotCalibError(
        'VALIDATION',
        `Station "${input.slug}" hat keine hotspots360[].`,
      )
    }

    const index = hotspots360.findIndex((h) => h.id === input.hotspotId)
    if (index < 0) {
      throw new MpzHotspotCalibError(
        'VALIDATION',
        `Hotspot "${input.hotspotId}" nicht gefunden.`,
      )
    }

    const nextHotspots360 = hotspots360.map((h, i) =>
      i === index ? { ...h, yaw, pitch } : h,
    )
    const nextStations = data.stations.map((s) =>
      s.slug === input.slug ? { ...s, hotspots360: nextHotspots360 } : s,
    )

    await io.writeStations(
      { stations: nextStations },
      { strict: true, validateAssets: false },
    )

    return { hotspotId: input.hotspotId, yaw, pitch }
  })
}
