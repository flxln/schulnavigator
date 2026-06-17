import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { POST } from './route'

const BASE = 'http://localhost:3000/api/mpz/hotspots/sphere'
const SECRET = 'test-studio-secret'

function postRequest(
  body: object,
  opts?: { cookie?: string },
): NextRequest {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  }
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(BASE), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

describe('POST /api/mpz/hotspots/sphere', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await POST(
      postRequest(
        { slug: 'daz', hotspotId: 'hs-frieda', yaw: 0, pitch: 0 },
        { cookie: SECRET },
      ),
    )
    expect(res.status).toBe(404)
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await POST(
      postRequest({ slug: 'daz', hotspotId: 'hs-frieda', yaw: 0, pitch: 0 }),
    )
    expect(res.status).toBe(401)
  })

  it('fehlende Felder → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await POST(postRequest({ slug: 'daz' }, { cookie: SECRET }))
    expect(res.status).toBe(400)
  })
})
