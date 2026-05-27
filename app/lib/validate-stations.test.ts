import { describe, expect, it } from 'vitest'
import raw from '@/data/stations.json'
import { validateStationsFile } from '@/lib/validate-stations'

describe('validateStationsFile isometrischer Hub', () => {
  it('akzeptiert gültige stations.json', () => {
    const stations = validateStationsFile(raw)
    expect(stations).toHaveLength(11)
    expect(stations.some((s) => s.slug === 'musik')).toBe(true)
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
