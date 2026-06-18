import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { POST } from './route'

const BASE = 'http://localhost:3000/api/mpz/stations/kunst/hotspots'
const SECRET = 'test-studio-secret'

function postRequest(
  body: unknown,
  opts?: { cookie?: string },
): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(BASE), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

const routeContext = { params: Promise.resolve({ slug: 'kunst' }) }

vi.mock('@/lib/mpz-station-hotspots', () => ({
  addStationHotspot: vi.fn(),
  MpzStationHotspotsError: class MpzStationHotspotsError extends Error {
    readonly code: string
    constructor(code: string, message: string) {
      super(message)
      this.code = code
    }
  },
}))

import { addStationHotspot, MpzStationHotspotsError } from '@/lib/mpz-station-hotspots'

describe('POST /api/mpz/stations/[slug]/hotspots', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(addStationHotspot).mockReset()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await POST(
      postRequest({ id: 'hs-x', mediumId: 'm1', x: 0.5, y: 0.5 }, { cookie: SECRET }),
      routeContext,
    )
    expect(res.status).toBe(404)
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await POST(
      postRequest({ id: 'hs-x', mediumId: 'm1', x: 0.5, y: 0.5 }),
      routeContext,
    )
    expect(res.status).toBe(401)
  })

  it('legt Hotspot an', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(addStationHotspot).mockResolvedValue({
      station: { slug: 'kunst' } as never,
      mtime: '2026-01-01T00:00:00.000Z',
    })

    const body = { id: 'hs-neu', mediumId: 'm1', x: 0.5, y: 0.5, iconSize: 0.2 }
    const res = await POST(postRequest(body, { cookie: SECRET }), routeContext)

    expect(res.status).toBe(200)
    expect(addStationHotspot).toHaveBeenCalledWith('kunst', body)
    await expect(res.json()).resolves.toMatchObject({ mtime: '2026-01-01T00:00:00.000Z' })
  })

  it('DUPLICATE_ID → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(addStationHotspot).mockRejectedValue(
      new MpzStationHotspotsError('DUPLICATE_ID', 'existiert bereits'),
    )

    const res = await POST(
      postRequest({ id: 'hs-x', mediumId: 'm1', x: 0.5, y: 0.5 }, { cookie: SECRET }),
      routeContext,
    )
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ error: 'DUPLICATE_ID' })
  })

  it('NOT_FOUND → 404', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(addStationHotspot).mockRejectedValue(
      new MpzStationHotspotsError('NOT_FOUND', 'Station fehlt'),
    )

    const res = await POST(
      postRequest({ id: 'hs-x', mediumId: 'm1', x: 0.5, y: 0.5 }, { cookie: SECRET }),
      routeContext,
    )
    expect(res.status).toBe(404)
  })
})
