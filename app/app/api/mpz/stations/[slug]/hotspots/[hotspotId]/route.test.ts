import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { DELETE } from './route'

const BASE = 'http://localhost:3000/api/mpz/stations/klassenzimmer/hotspots/hs-text'
const SECRET = 'test-studio-secret'

function deleteRequest(opts?: { cookie?: string }): NextRequest {
  const headers: Record<string, string> = {}
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(BASE), { method: 'DELETE', headers })
}

const routeContext = {
  params: Promise.resolve({ slug: 'klassenzimmer', hotspotId: 'hs-text' }),
}

vi.mock('@/lib/mpz-station-hotspots', () => ({
  removeStationHotspot: vi.fn(),
  MpzStationHotspotsError: class MpzStationHotspotsError extends Error {
    readonly code: string
    constructor(code: string, message: string) {
      super(message)
      this.code = code
    }
  },
}))

import { removeStationHotspot } from '@/lib/mpz-station-hotspots'

describe('DELETE /api/mpz/stations/[slug]/hotspots/[hotspotId]', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    vi.mocked(removeStationHotspot).mockReset()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await DELETE(deleteRequest({ cookie: SECRET }), routeContext)
    expect(res.status).toBe(404)
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await DELETE(deleteRequest(), routeContext)
    expect(res.status).toBe(401)
  })

  it('Erfolg mit gemocktem removeStationHotspot', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(removeStationHotspot).mockResolvedValue({
      station: {
        slug: 'klassenzimmer',
        titel: 'K',
        beschreibung: 'B',
        medien: [],
        hotspots360: [],
      },
      mtime: '2026-01-01T00:00:00.000Z',
    })
    const res = await DELETE(deleteRequest({ cookie: SECRET }), routeContext)
    expect(res.status).toBe(200)
    const json = (await res.json()) as { mtime: string }
    expect(json.mtime).toBe('2026-01-01T00:00:00.000Z')
  })

  it('NOT_FOUND → 404', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const { MpzStationHotspotsError } = await import('@/lib/mpz-station-hotspots')
    vi.mocked(removeStationHotspot).mockRejectedValue(
      new MpzStationHotspotsError('NOT_FOUND', 'fehlt'),
    )
    const res = await DELETE(deleteRequest({ cookie: SECRET }), routeContext)
    expect(res.status).toBe(404)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('NOT_FOUND')
  })
})
