import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { GET } from './route'

const BASE = 'http://localhost:3000/api/mpz/stations/hort/hotspot-icons'
const SECRET = 'test-studio-secret'

function getRequest(opts?: { cookie?: string }): NextRequest {
  const headers: Record<string, string> = {}
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(BASE), { method: 'GET', headers })
}

const routeContext = { params: Promise.resolve({ slug: 'hort' }) }

vi.mock('@/lib/mpz-hotspot-icon-ingest', () => ({
  listStationHotspotIcons: vi.fn(),
}))

import { listStationHotspotIcons } from '@/lib/mpz-hotspot-icon-ingest'

describe('GET /api/mpz/stations/[slug]/hotspot-icons', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(listStationHotspotIcons).mockReset()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await GET(getRequest({ cookie: SECRET }), routeContext)
    expect(res.status).toBe(404)
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await GET(getRequest(), routeContext)
    expect(res.status).toBe(401)
  })

  it('liefert Icon-Pfade', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(listStationHotspotIcons).mockResolvedValue({
      paths: ['/media/hort/icons/play.svg'],
    })
    const res = await GET(getRequest({ cookie: SECRET }), routeContext)
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      paths: ['/media/hort/icons/play.svg'],
    })
  })
})
