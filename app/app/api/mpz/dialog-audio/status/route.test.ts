import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { GET } from './route'

const SECRET = 'test-studio-secret'

function getRequest(slug: string, cookie?: string): NextRequest {
  const headers: Record<string, string> = {}
  if (cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${cookie}`
  }
  return new NextRequest(
    new URL(`http://localhost:3000/api/mpz/dialog-audio/status?slug=${encodeURIComponent(slug)}`),
    { method: 'GET', headers },
  )
}

describe('GET /api/mpz/dialog-audio/status', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await GET(getRequest('daz'))
    expect(res.status).toBe(401)
  })

  it('ohne slug → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await GET(
      new NextRequest('http://localhost:3000/api/mpz/dialog-audio/status', {
        headers: { cookie: `${MPZ_STUDIO_COOKIE}=${SECRET}` },
      }),
    )
    expect(res.status).toBe(400)
  })

  it('klassenzimmer ohne Dialog → 200 mit leerem Audit', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await GET(getRequest('klassenzimmer', SECRET))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      slug: 'klassenzimmer',
      segments: [],
      orphans: [],
      missingCount: 0,
      driftCount: 0,
    })
  })

  it('daz liefert Segmente und Zähler', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await GET(getRequest('daz', SECRET))
    expect(res.status).toBe(200)
    const json = (await res.json()) as {
      slug: string
      segments: unknown[]
      missingCount: number
      driftCount: number
      orphans: string[]
    }
    expect(json.slug).toBe('daz')
    expect(json.segments.length).toBe(9)
    expect(typeof json.missingCount).toBe('number')
    expect(Array.isArray(json.orphans)).toBe(true)
  })
})
