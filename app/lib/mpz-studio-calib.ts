import type { ViewerMode } from '@/lib/types'

export function mpzStationCalibHref(input: {
  viewer: ViewerMode
  slug: string
  hasBild: boolean
  hasPanorama360: boolean
}): string | null {
  if (input.viewer === 'equirectangular') {
    if (!input.hasPanorama360) {
      return null
    }
    return `/mpz/calib/sphere/${input.slug}`
  }
  if (input.viewer === 'flat' && input.hasBild) {
    return `/mpz/calib/flat/${input.slug}`
  }
  return null
}
