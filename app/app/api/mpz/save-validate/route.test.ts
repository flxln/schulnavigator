import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { POST } from './route'

const BASE = 'http://localhost:3000/api/mpz/save-validate'
const SECRET = 'test-studio-secret'

function postRequest(opts?: { cookie?: string }): NextRequest {
  const headers: Record<string, string> = {}
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(BASE), { method: 'POST', headers })
}

describe('POST /api/mpz/save-validate', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await POST(postRequest({ cookie: SECRET }))
    expect(res.status).toBe(404)
  })

  it('ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await POST(postRequest())
    expect(res.status).toBe(401)
  })

  it('mit Cookie → 200 und Report-Form', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await POST(postRequest({ cookie: SECRET }))
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      report: { stationSummaries: unknown[]; ok: boolean }
      rolledBack: boolean
      saved: boolean
    }
    expect(body.report.stationSummaries).toHaveLength(12)
    expect(typeof body.report.ok).toBe('boolean')
    expect(typeof body.rolledBack).toBe('boolean')
    expect(typeof body.saved).toBe('boolean')
  })
})
