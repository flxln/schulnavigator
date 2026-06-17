import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { DELETE } from './route'

const BASE = 'http://localhost:3000/api/mpz/stations/klassenzimmer/medien/demo-audio'
const SECRET = 'test-studio-secret'

function deleteRequest(opts?: { cookie?: string }): NextRequest {
  const headers: Record<string, string> = {}
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(BASE), { method: 'DELETE', headers })
}

const routeContext = {
  params: Promise.resolve({ slug: 'klassenzimmer', mediumId: 'demo-audio' }),
}

vi.mock('@/lib/mpz-station-medien', () => ({
  removeStationMedium: vi.fn(),
  MpzStationMedienError: class MpzStationMedienError extends Error {
    readonly code: string
    constructor(code: string, message: string) {
      super(message)
      this.code = code
    }
  },
}))

import { removeStationMedium } from '@/lib/mpz-station-medien'

describe('DELETE /api/mpz/stations/[slug]/medien/[mediumId]', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    vi.mocked(removeStationMedium).mockReset()
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

  it('Erfolg mit gemocktem removeStationMedium', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(removeStationMedium).mockResolvedValue({
      station: { slug: 'klassenzimmer', titel: 'K', beschreibung: 'B', medien: [] },
      mtime: '2026-01-01T00:00:00.000Z',
      fileDeleted: true,
      quelle: '/media/klassenzimmer/audio/x.mp3',
    })
    const res = await DELETE(deleteRequest({ cookie: SECRET }), routeContext)
    expect(res.status).toBe(200)
    const json = (await res.json()) as { fileDeleted: boolean }
    expect(json.fileDeleted).toBe(true)
  })

  it('HOTSPOT_REFERENCE → 422', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const { MpzStationMedienError } = await import('@/lib/mpz-station-medien')
    vi.mocked(removeStationMedium).mockRejectedValue(
      new MpzStationMedienError('HOTSPOT_REFERENCE', 'blockiert'),
    )
    const res = await DELETE(deleteRequest({ cookie: SECRET }), routeContext)
    expect(res.status).toBe(422)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('HOTSPOT_REFERENCE')
  })
})
