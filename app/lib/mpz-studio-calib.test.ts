import { describe, expect, it } from 'vitest'
import { mpzStationCalibHref } from '@/lib/mpz-studio-calib'

describe('mpz-studio-calib', () => {
  it('equirectangular mit panorama360 → Sphere-Kalib', () => {
    expect(
      mpzStationCalibHref({
        viewer: 'equirectangular',
        slug: 'klassenzimmer',
        hasBild: true,
        hasPanorama360: true,
      }),
    ).toBe('/mpz/calib/sphere/klassenzimmer')
  })

  it('equirectangular ohne panorama360 → null', () => {
    expect(
      mpzStationCalibHref({
        viewer: 'equirectangular',
        slug: 'klassenzimmer',
        hasBild: true,
        hasPanorama360: false,
      }),
    ).toBeNull()
  })

  it('equirectangular ohne Bild aber mit panorama360 → Sphere-Kalib', () => {
    expect(
      mpzStationCalibHref({
        viewer: 'equirectangular',
        slug: 'klassenzimmer',
        hasBild: false,
        hasPanorama360: true,
      }),
    ).toBe('/mpz/calib/sphere/klassenzimmer')
  })

  it('flat mit Bild → Flat-Kalib', () => {
    expect(
      mpzStationCalibHref({
        viewer: 'flat',
        slug: 'kunst',
        hasBild: true,
        hasPanorama360: false,
      }),
    ).toBe('/mpz/calib/flat/kunst')
  })

  it('flat ohne Bild → null', () => {
    expect(
      mpzStationCalibHref({
        viewer: 'flat',
        slug: 'kunst',
        hasBild: false,
        hasPanorama360: false,
      }),
    ).toBeNull()
  })

  it('Slug bleibt unverändert (kein Encoding)', () => {
    expect(
      mpzStationCalibHref({
        viewer: 'flat',
        slug: 'slug/with space',
        hasBild: true,
        hasPanorama360: false,
      }),
    ).toBe('/mpz/calib/flat/slug/with space')
  })
})
