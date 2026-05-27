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

  it('wirft bei unbekanntem slug ohne Hub-Zuordnung', () => {
    const broken = structuredClone(raw) as {
      stations: { slug: string }[]
    }
    broken.stations[0]!.slug = 'unbekannter-raum'
    expect(() => validateStationsFile(broken as unknown)).toThrow(
      'keine isometrische Hub-Zuordnung',
    )
  })
})
