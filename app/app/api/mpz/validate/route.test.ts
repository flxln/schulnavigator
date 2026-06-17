import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { GET } from './route'

const BASE = 'http://localhost:3000/api/mpz/validate'
const SECRET = 'test-studio-secret'

function getRequest(opts?: { cookie?: string }): NextRequest {
  const headers: Record<string, string> = {}
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(BASE), { method: 'GET', headers })
}

describe('GET /api/mpz/validate', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await GET(getRequest({ cookie: SECRET }))
    expect(res.status).toBe(404)
  })

  it('ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await GET(getRequest())
    expect(res.status).toBe(401)
  })

  it('mit Cookie → 200 und Report-Form', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await GET(getRequest({ cookie: SECRET }))
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      ok: boolean
      stationSummaries: unknown[]
      checkedAt: string
    }
    expect(body.stationSummaries).toHaveLength(12)
    expect(body.checkedAt).toBeTruthy()
    expect(typeof body.ok).toBe('boolean')
  })
})
