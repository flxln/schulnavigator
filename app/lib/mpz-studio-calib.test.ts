import { describe, expect, it } from 'vitest'
import { mpzStationCalibHref } from '@/lib/mpz-studio-calib'

describe('mpz-studio-calib', () => {
  it('equirectangular mit Bild → Sphere-Kalib', () => {
    expect(
      mpzStationCalibHref({
        viewer: 'equirectangular',
        slug: 'klassenzimmer',
        hasBild: true,
      }),
    ).toBe('/raum/klassenzimmer?hotspot-calib=1')
  })

  it('equirectangular ohne Bild → Sphere-Kalib', () => {
    expect(
      mpzStationCalibHref({
        viewer: 'equirectangular',
        slug: 'klassenzimmer',
        hasBild: false,
      }),
    ).toBe('/raum/klassenzimmer?hotspot-calib=1')
  })

  it('flat mit Bild → Flat-Kalib', () => {
    expect(
      mpzStationCalibHref({
        viewer: 'flat',
        slug: 'kunst',
        hasBild: true,
      }),
    ).toBe('/mpz/calib/flat/kunst')
  })

  it('flat ohne Bild → null', () => {
    expect(
      mpzStationCalibHref({
        viewer: 'flat',
        slug: 'kunst',
        hasBild: false,
      }),
    ).toBeNull()
  })

  it('Slug bleibt unverändert (kein Encoding)', () => {
    expect(
      mpzStationCalibHref({
        viewer: 'flat',
        slug: 'slug/with space',
        hasBild: true,
      }),
    ).toBe('/mpz/calib/flat/slug/with space')
  })
})
