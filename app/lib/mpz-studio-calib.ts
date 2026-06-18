import type { ViewerMode } from '@/lib/types'

export function mpzStationCalibHref(input: {
  viewer: ViewerMode
  slug: string
  hasBild: boolean
}): string | null {
  if (input.viewer === 'equirectangular') {
    return `/raum/${input.slug}?hotspot-calib=1`
  }
  if (input.viewer === 'flat' && input.hasBild) {
    return `/mpz/calib/flat/${input.slug}`
  }
  return null
}
