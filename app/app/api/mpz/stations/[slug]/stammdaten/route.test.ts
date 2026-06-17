import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { PATCH } from './route'

const BASE = 'http://localhost:3000/api/mpz/stations/hort/stammdaten'
const SECRET = 'test-studio-secret'

function patchRequest(
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
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  })
}

const routeContext = { params: Promise.resolve({ slug: 'hort' }) }

vi.mock('@/lib/mpz-station-stammdaten', () => ({
  patchStationStammdaten: vi.fn(),
  MpzStationStammdatenError: class MpzStationStammdatenError extends Error {
    readonly code: string
    constructor(code: string, message: string) {
      super(message)
      this.code = code
    }
  },
}))

import { patchStationStammdaten } from '@/lib/mpz-station-stammdaten'

describe('PATCH /api/mpz/stations/[slug]/stammdaten', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    vi.mocked(patchStationStammdaten).mockReset()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await PATCH(
      patchRequest({ beschreibung: 'Neu' }, { cookie: SECRET }),
      routeContext,
    )
    expect(res.status).toBe(404)
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await PATCH(patchRequest({ beschreibung: 'Neu' }), routeContext)
    expect(res.status).toBe(401)
  })

  it('ungültiger Body → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await PATCH(
      patchRequest({ viewer: 'invalid' }, { cookie: SECRET }),
      routeContext,
    )
    expect(res.status).toBe(400)
  })

  it('Erfolg mit gemocktem patchStationStammdaten', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(patchStationStammdaten).mockResolvedValue({
      station: { slug: 'hort', titel: 'Hort', beschreibung: 'Neu', medien: [] },
      mtime: '2026-01-01T00:00:00.000Z',
      warnings: [],
    })
    const res = await PATCH(
      patchRequest({ beschreibung: 'Neu' }, { cookie: SECRET }),
      routeContext,
    )
    expect(res.status).toBe(200)
    const json = (await res.json()) as { station: { beschreibung: string } }
    expect(json.station.beschreibung).toBe('Neu')
  })
})
