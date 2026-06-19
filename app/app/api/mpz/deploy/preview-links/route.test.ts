import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { GET } from './route'

const BASE = 'http://localhost:3000/api/mpz/deploy/preview-links'
const SECRET = 'test-studio-secret'

vi.mock('@/lib/mpz-deploy-preview', () => ({
  buildDeployPreviewLinks: vi.fn(),
}))

import { buildDeployPreviewLinks } from '@/lib/mpz-deploy-preview'
import { MpzEnvLocalError } from '@/lib/mpz-env-local'

function get(cookie?: string): NextRequest {
  const headers: Record<string, string> = {}
  if (cookie) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${cookie}`
  }
  return new NextRequest(new URL(BASE), { method: 'GET', headers })
}

describe('GET /api/mpz/deploy/preview-links', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(buildDeployPreviewLinks).mockReset()
  })

  it('ohne BASE_URL → 422', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(buildDeployPreviewLinks).mockImplementation(() => {
      throw new MpzEnvLocalError('VALIDATION', 'fehlt')
    })
    const res = await GET(get(SECRET))
    expect(res.status).toBe(422)
    expect((await res.json()).error).toBe('VALIDATION')
  })
})
