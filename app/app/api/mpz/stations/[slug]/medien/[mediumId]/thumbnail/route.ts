import { type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { handleMediumAssetUpload } from '@/lib/mpz-medium-asset-upload-route'

export const runtime = 'nodejs'

export const POST = withMpzStudioAccess(async (req: NextRequest, context) => {
  const { slug = '', mediumId = '' } = await context!.params
  return handleMediumAssetUpload(req, slug, mediumId, 'thumbnail')
})
