import {
  createMpzContentIo,
  type MpzContentIo,
  withMpzWriteLock,
} from '@/lib/mpz-content-io'
import { isHubSlug } from '@/lib/schoolhouse-hub-map'
import {
  normalizeYawDeg,
  roundDeg,
} from '@/lib/raum-viewer/sphere-marker-conventions'
import type { Station, StationsFile, ViewerMode } from '@/lib/types'

export type MpzViewIngestErrorCode = 'VALIDATION' | 'IO'

export class MpzViewIngestError extends Error {
  readonly code: MpzViewIngestErrorCode

  constructor(code: MpzViewIngestErrorCode, message: string) {
    super(message)
    this.name = 'MpzViewIngestError'
    this.code = code
  }
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
    throw new MpzViewIngestError('VALIDATION', `Station "${slug}" nicht gefunden.`)
  }
  return station
}

export async function applySphereStartView(
  input: { slug: string; startYaw: number; startPitch: number },
  io: MpzContentIo = createMpzContentIo(),
): Promise<{ slug: string; startYaw: number; startPitch: number }> {
  return withMpzWriteLock(async () => {
    if (!isHubSlug(input.slug)) {
      throw new MpzViewIngestError('VALIDATION', `Unbekannter slug "${input.slug}".`)
    }
    if (!Number.isFinite(input.startYaw) || !Number.isFinite(input.startPitch)) {
      throw new MpzViewIngestError(
        'VALIDATION',
        'startYaw und startPitch müssen Zahlen sein.',
      )
    }

    const startYaw = normalizeYawDeg(input.startYaw)
    const startPitch = clampPitch(input.startPitch)
    const data = await io.readStations()
    const station = findStation(data, input.slug)
    const viewer = resolveViewer(station)
    if (viewer !== 'equirectangular') {
      throw new MpzViewIngestError(
        'VALIDATION',
        `Station "${input.slug}" ist kein Sphere-Viewer.`,
      )
    }

    const nextStations = data.stations.map((s) =>
      s.slug === input.slug ? { ...s, startYaw, startPitch } : s,
    )

    await io.writeStations(
      { stations: nextStations },
      {
        strict: true,
        validateAssets: false,
        makeBackup: true,
        postValidate: true,
        touchedSlugs: [input.slug],
      },
    )

    return { slug: input.slug, startYaw, startPitch }
  })
}
