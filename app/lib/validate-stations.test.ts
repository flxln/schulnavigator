import { describe, expect, it } from 'vitest'
import raw from '@/data/stations.json'
import { validateStationsFile } from '@/lib/validate-stations'

describe('validateStationsFile isometrischer Hub', () => {
  it('akzeptiert gültige stations.json', () => {
    const stations = validateStationsFile(raw)
    expect(stations).toHaveLength(11)
    expect(stations.some((s) => s.slug === 'musik')).toBe(true)
  })

  it('akzeptiert dialog mit gruppe und beide', () => {
    const data = structuredClone(raw) as {
      stations: Record<string, unknown>[]
    }
    const daz = data.stations.find((s) => s.slug === 'daz')
    expect(daz).toBeDefined()
    const stations = validateStationsFile(data as unknown)
    const station = stations.find((s) => s.slug === 'daz')
    expect(station?.dialog?.segmente).toHaveLength(9)
    expect(station?.dialog?.gruppen?.[0]?.id).toBe('gruesse')
  })

  it('wirft wenn beide in figuren steht', () => {
    const data = structuredClone(raw) as { stations: Record<string, unknown>[] }
    const daz = data.stations.find((s) => s.slug === 'daz') as Record<string, unknown>
    const dialog = daz.dialog as Record<string, unknown>
    dialog.figuren = ['frieda', 'beide']
    expect(() => validateStationsFile(data as unknown)).toThrow('muss frieda oder otto sein')
  })

  it('wirft bei unbekannter gruppe', () => {
    const data = structuredClone(raw) as { stations: Record<string, unknown>[] }
    const daz = data.stations.find((s) => s.slug === 'daz') as Record<string, unknown>
    const dialog = daz.dialog as Record<string, unknown>
    const segs = dialog.segmente as Record<string, unknown>[]
    segs[2]!.gruppe = 'fehlt'
    expect(() => validateStationsFile(data as unknown)).toThrow('unbekannt')
  })

  it('akzeptiert dialog-Hotspot ohne mediumId', () => {
    const data = structuredClone(raw) as { stations: Record<string, unknown>[] }
    const daz = data.stations.find((s) => s.slug === 'daz') as Record<string, unknown>
    const hotspots = daz.hotspots as Record<string, unknown>[]
    expect(hotspots[0]?.action).toBe('dialog')
    expect(hotspots[0]?.mediumId).toBeUndefined()
    const stations = validateStationsFile(data as unknown)
    expect(stations.find((s) => s.slug === 'daz')?.hotspots).toHaveLength(2)
  })

  it('wirft bei dialog-Hotspot mit mediumId', () => {
    const data = structuredClone(raw) as { stations: Record<string, unknown>[] }
    const daz = data.stations.find((s) => s.slug === 'daz') as Record<string, unknown>
    const hotspots = daz.hotspots as Record<string, unknown>[]
    hotspots[0] = { ...hotspots[0], mediumId: 'x' }
    expect(() => validateStationsFile(data as unknown)).toThrow(
      'darf kein mediumId',
    )
  })

  it('wirft wenn mascot nicht in dialog.figuren', () => {
    const data = structuredClone(raw) as { stations: Record<string, unknown>[] }
    const daz = data.stations.find((s) => s.slug === 'daz') as Record<string, unknown>
    const dialog = daz.dialog as Record<string, unknown>
    dialog.figuren = ['frieda']
    const segs = dialog.segmente as { rolle: string }[]
    dialog.segmente = segs.filter((s) => s.rolle === 'frieda')
    expect(() => validateStationsFile(data as unknown)).toThrow(
      'fehlt in dialog.figuren',
    )
  })

  it('wirft bei action dialog ohne station.dialog', () => {
    const data = structuredClone(raw) as { stations: Record<string, unknown>[] }
    const daz = data.stations.find((s) => s.slug === 'daz') as Record<string, unknown>
    delete daz.dialog
    expect(() => validateStationsFile(data as unknown)).toThrow(
      'erfordert station.dialog',
    )
  })

  it('akzeptiert dialog-Hotspot mit gültigem mascotSize', () => {
    const data = structuredClone(raw) as { stations: Record<string, unknown>[] }
    const daz = data.stations.find((s) => s.slug === 'daz') as Record<string, unknown>
    const hotspots = daz.hotspots as Record<string, unknown>[]
    hotspots[0] = { ...hotspots[0], mascotSize: 0.22 }
    const stations = validateStationsFile(data as unknown)
    const hs = stations.find((s) => s.slug === 'daz')?.hotspots?.[0]
    expect(hs?.mascotSize).toBe(0.22)
  })

  it('gibt mascotSize im Round-Trip zurück', () => {
    const data = structuredClone(raw) as { stations: Record<string, unknown>[] }
    const daz = data.stations.find((s) => s.slug === 'daz') as Record<string, unknown>
    const hotspots = daz.hotspots as Record<string, unknown>[]
    hotspots[0] = { ...hotspots[0], mascotSize: 0.3 }
    const stations = validateStationsFile(data as unknown)
    expect(
      stations.find((s) => s.slug === 'daz')?.hotspots?.[0]?.mascotSize,
    ).toBe(0.3)
  })

  it('wirft bei mascotSize auf Medien-Hotspot', () => {
    const data = structuredClone(raw) as { stations: Record<string, unknown>[] }
    const klassenzimmer = data.stations.find(
      (s) => s.slug === 'klassenzimmer',
    ) as Record<string, unknown>
    const hotspots = klassenzimmer.hotspots as Record<string, unknown>[]
    hotspots[0] = { ...hotspots[0], mascotSize: 0.2 }
    expect(() => validateStationsFile(data as unknown)).toThrow(
      'darf kein mascotSize',
    )
  })

  it('akzeptiert mascotFlipX auf Dialog-Hotspot', () => {
    const data = structuredClone(raw) as { stations: Record<string, unknown>[] }
    const daz = data.stations.find((s) => s.slug === 'daz') as Record<string, unknown>
    const hotspots = daz.hotspots as Record<string, unknown>[]
    hotspots[0] = { ...hotspots[0], mascotFlipX: true }
    const stations = validateStationsFile(data as unknown)
    expect(
      stations.find((s) => s.slug === 'daz')?.hotspots?.[0]?.mascotFlipX,
    ).toBe(true)
  })

  it('wirft bei mascotFlipX auf Medien-Hotspot', () => {
    const data = structuredClone(raw) as { stations: Record<string, unknown>[] }
    const klassenzimmer = data.stations.find(
      (s) => s.slug === 'klassenzimmer',
    ) as Record<string, unknown>
    const hotspots = klassenzimmer.hotspots as Record<string, unknown>[]
    hotspots[0] = { ...hotspots[0], mascotFlipX: true }
    expect(() => validateStationsFile(data as unknown)).toThrow(
      'darf kein mascotFlipX',
    )
  })

  it('wirft bei mascotSize außerhalb des Bereichs', () => {
    const data = structuredClone(raw) as { stations: Record<string, unknown>[] }
    const daz = data.stations.find((s) => s.slug === 'daz') as Record<string, unknown>
    const hotspots = daz.hotspots as Record<string, unknown>[]
    hotspots[0] = { ...hotspots[0], mascotSize: 1.5 }
    expect(() => validateStationsFile(data as unknown)).toThrow('mascotSize muss')
  })

  it('wirft bei unbekanntem slug ohne Hub-Zuordnung', () => {
    const broken = structuredClone(raw) as {
      stations: { slug: string }[]
    }
    broken.stations[0]!.slug = 'unbekannter-raum'
    expect(() => validateStationsFile(broken as unknown)).toThrow(
      'keine isometrische Hub-Zuordnung',
    )
  })

  it('akzeptiert gültigen dialog.bubble-Block', () => {
    const data = structuredClone(raw) as { stations: Record<string, unknown>[] }
    const daz = data.stations.find((s) => s.slug === 'daz') as Record<string, unknown>
    const dialog = daz.dialog as Record<string, unknown>
    dialog.bubble = {
      y: 0.1,
      x: 0.5,
      maxWidth: 0.9,
      fontSize: 0.035,
      followPan: true,
    }
    const stations = validateStationsFile(data as unknown)
    expect(stations.find((s) => s.slug === 'daz')?.dialog?.bubble).toEqual({
      y: 0.1,
      x: 0.5,
      maxWidth: 0.9,
      fontSize: 0.035,
      followPan: true,
    })
  })

  it('wirft bei bubble.y außerhalb 0–1', () => {
    const data = structuredClone(raw) as { stations: Record<string, unknown>[] }
    const daz = data.stations.find((s) => s.slug === 'daz') as Record<string, unknown>
    const dialog = daz.dialog as Record<string, unknown>
    dialog.bubble = { y: 1.5 }
    expect(() => validateStationsFile(data as unknown)).toThrow('bubble.y muss')
  })

  it('wirft bei ungültigem segment.tail', () => {
    const data = structuredClone(raw) as { stations: Record<string, unknown>[] }
    const daz = data.stations.find((s) => s.slug === 'daz') as Record<string, unknown>
    const dialog = daz.dialog as Record<string, unknown>
    const segs = dialog.segmente as Record<string, unknown>[]
    segs[0]!.tail = 'oben'
    expect(() => validateStationsFile(data as unknown)).toThrow('tail ungültig')
  })

  it('akzeptiert segment.tail und gibt ihn im Round-Trip zurück', () => {
    const data = structuredClone(raw) as { stations: Record<string, unknown>[] }
    const daz = data.stations.find((s) => s.slug === 'daz') as Record<string, unknown>
    const dialog = daz.dialog as Record<string, unknown>
    const segs = dialog.segmente as Record<string, unknown>[]
    segs[2]!.tail = 'left'
    const stations = validateStationsFile(data as unknown)
    expect(
      stations.find((s) => s.slug === 'daz')?.dialog?.segmente[2]?.tail,
    ).toBe('left')
  })

  it('wirft bei followPan ohne boolean', () => {
    const data = structuredClone(raw) as { stations: Record<string, unknown>[] }
    const daz = data.stations.find((s) => s.slug === 'daz') as Record<string, unknown>
    const dialog = daz.dialog as Record<string, unknown>
    dialog.bubble = { followPan: 'yes' }
    expect(() => validateStationsFile(data as unknown)).toThrow(
      'followPan muss boolean',
    )
  })
})
