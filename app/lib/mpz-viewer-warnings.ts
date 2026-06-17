import type { Station, ViewerMode } from '@/lib/types'

export type ViewerChangeWarning = {
  kind: 'missing-panorama' | 'flat-hotspots-present' | 'sphere-hotspots-present'
  message: string
}

type StationViewerShape = Pick<
  Station,
  'viewer' | 'panorama360' | 'hotspots' | 'hotspots360'
>

function resolveViewer(station: StationViewerShape): ViewerMode {
  return station.viewer ?? 'flat'
}

export function hasBlockingHotspots(
  station: Pick<Station, 'hotspots' | 'hotspots360'>,
): boolean {
  return (
    (station.hotspots?.length ?? 0) > 0 || (station.hotspots360?.length ?? 0) > 0
  )
}

export function getViewerChangeWarnings(
  before: StationViewerShape,
  nextViewer: ViewerMode,
): ViewerChangeWarning[] {
  const currentViewer = resolveViewer(before)
  if (currentViewer === nextViewer) {
    return []
  }

  const warnings: ViewerChangeWarning[] = []

  if (nextViewer === 'equirectangular') {
    if (!before.panorama360?.trim()) {
      warnings.push({
        kind: 'missing-panorama',
        message:
          'Für den Sphere-Viewer fehlt panorama360 — der Speichervorgang schlägt vermutlich fehl.',
      })
    }
    if (before.hotspots !== undefined) {
      warnings.push({
        kind: 'flat-hotspots-present',
        message:
          'Flat-Hotspots (hotspots) müssen vor dem Wechsel entfernt werden — Hotspot-UI folgt in #162.',
      })
    }
  }

  if (nextViewer === 'flat' && before.hotspots360 !== undefined) {
    warnings.push({
      kind: 'sphere-hotspots-present',
      message:
        'Sphere-Hotspots (hotspots360) müssen vor dem Wechsel entfernt werden — Hotspot-UI folgt in #162.',
    })
  }

  return warnings
}
