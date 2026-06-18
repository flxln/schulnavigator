import {
  FEST_DEV_TOKEN,
  HEFT_DEV_TOKEN,
} from '@/lib/access-token-constants.mjs'
import { MpzEnvLocalError, readDeployEnv, validateBaseUrl } from '@/lib/mpz-env-local'
import { buildEntryUrl, buildRoomUrl } from '@/lib/qr-urls'
import { MPZ_HUB_SLUGS } from '@/lib/schoolhouse-hub-map'

export type DeployPreviewLinks = {
  hubUrl: string
  entryFestUrl: string
  entryHeftUrl: string
  rooms: Array<{ slug: string; url: string }>
}

export function buildDeployPreviewLinks(
  appRoot?: string,
): DeployPreviewLinks {
  const { baseUrl } = readDeployEnv(appRoot)
  if (!baseUrl) {
    throw new MpzEnvLocalError(
      'VALIDATION',
      'NEXT_PUBLIC_BASE_URL fehlt — im Deploy-Tab setzen.',
    )
  }

  const normalized = validateBaseUrl(baseUrl)
  const hubUrl = new URL('/', normalized.endsWith('/') ? normalized : `${normalized}/`).href

  return {
    hubUrl,
    entryFestUrl: buildEntryUrl(normalized, FEST_DEV_TOKEN),
    entryHeftUrl: buildEntryUrl(normalized, HEFT_DEV_TOKEN),
    rooms: MPZ_HUB_SLUGS.map((slug) => ({
      slug,
      url: buildRoomUrl(normalized, slug),
    })),
  }
}
