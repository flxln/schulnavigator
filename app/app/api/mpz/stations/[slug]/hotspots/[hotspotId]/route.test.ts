import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { DELETE, PATCH, parsePatch } from './route'

const BASE = 'http://localhost:3000/api/mpz/stations/klassenzimmer/hotspots/hs-text'
const SECRET = 'test-studio-secret'

function request(
  method: 'DELETE' | 'PATCH',
  opts?: { cookie?: string; body?: unknown },
): NextRequest {
  const headers: Record<string, string> = {}
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  if (opts?.body !== undefined) {
    headers['content-type'] = 'application/json'
  }
  return new NextRequest(new URL(BASE), {
    method,
    headers,
    body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
}

const routeContext = {
  params: Promise.resolve({ slug: 'klassenzimmer', hotspotId: 'hs-text' }),
}

vi.mock('@/lib/mpz-station-hotspots', () => ({
  removeStationHotspot: vi.fn(),
  patchStationHotspot: vi.fn(),
  MpzStationHotspotsError: class MpzStationHotspotsError extends Error {
    readonly code: string
    constructor(code: string, message: string) {
      super(message)
      this.code = code
    }
  },
}))

import { patchStationHotspot, removeStationHotspot } from '@/lib/mpz-station-hotspots'

describe('parsePatch', () => {
  it('akzeptiert null für icon und iconSize', () => {
    expect(parsePatch({ icon: null, iconSize: null })).toEqual({
      icon: null,
      iconSize: null,
    })
  })

  it('label: "" ist gültig', () => {
    expect(parsePatch({ label: '' })).toEqual({ label: '' })
  })

  it('leerer Body → null', () => {
    expect(parsePatch({})).toBeNull()
    expect(parsePatch({ id: 'ignored' })).toBeNull()
  })
})

describe('DELETE /api/mpz/stations/[slug]/hotspots/[hotspotId]', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    vi.mocked(removeStationHotspot).mockReset()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await DELETE(request('DELETE', { cookie: SECRET }), routeContext)
    expect(res.status).toBe(404)
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await DELETE(request('DELETE'), routeContext)
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
    const res = await DELETE(request('DELETE', { cookie: SECRET }), routeContext)
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
    const res = await DELETE(request('DELETE', { cookie: SECRET }), routeContext)
    expect(res.status).toBe(404)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('NOT_FOUND')
  })

  it('INVALID_COORDS → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const { MpzStationHotspotsError } = await import('@/lib/mpz-station-hotspots')
    vi.mocked(removeStationHotspot).mockRejectedValue(
      new MpzStationHotspotsError('INVALID_COORDS', 'ungültig'),
    )
    const res = await DELETE(request('DELETE', { cookie: SECRET }), routeContext)
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ error: 'INVALID_COORDS' })
  })
})

describe('PATCH /api/mpz/stations/[slug]/hotspots/[hotspotId]', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(patchStationHotspot).mockReset()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await PATCH(
      request('PATCH', { cookie: SECRET, body: { label: 'Neu' } }),
      routeContext,
    )
    expect(res.status).toBe(404)
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await PATCH(request('PATCH', { body: { label: 'Neu' } }), routeContext)
    expect(res.status).toBe(401)
  })

  it('Erfolg mit gemocktem patchStationHotspot', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(patchStationHotspot).mockResolvedValue({
      station: { slug: 'klassenzimmer' } as never,
      mtime: '2026-01-01T00:00:00.000Z',
    })

    const body = { label: 'Neu', yaw: 10, pitch: -5 }
    const res = await PATCH(request('PATCH', { cookie: SECRET, body }), routeContext)

    expect(res.status).toBe(200)
    expect(patchStationHotspot).toHaveBeenCalledWith('klassenzimmer', 'hs-text', body)
    await expect(res.json()).resolves.toMatchObject({ mtime: '2026-01-01T00:00:00.000Z' })
  })

  it('leerer Body → 400 INVALID_BODY', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await PATCH(request('PATCH', { cookie: SECRET, body: {} }), routeContext)
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ error: 'INVALID_BODY' })
  })

  it('NOT_FOUND → 404', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const { MpzStationHotspotsError } = await import('@/lib/mpz-station-hotspots')
    vi.mocked(patchStationHotspot).mockRejectedValue(
      new MpzStationHotspotsError('NOT_FOUND', 'fehlt'),
    )
    const res = await PATCH(
      request('PATCH', { cookie: SECRET, body: { label: 'X' } }),
      routeContext,
    )
    expect(res.status).toBe(404)
  })

  it('NOT_EDITABLE → 403', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const { MpzStationHotspotsError } = await import('@/lib/mpz-station-hotspots')
    vi.mocked(patchStationHotspot).mockRejectedValue(
      new MpzStationHotspotsError('NOT_EDITABLE', 'Dialog-Hotspot'),
    )
    const res = await PATCH(
      request('PATCH', { cookie: SECRET, body: { label: 'X' } }),
      routeContext,
    )
    expect(res.status).toBe(403)
    await expect(res.json()).resolves.toMatchObject({ error: 'NOT_EDITABLE' })
  })

  it('INVALID_COORDS → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const { MpzStationHotspotsError } = await import('@/lib/mpz-station-hotspots')
    vi.mocked(patchStationHotspot).mockRejectedValue(
      new MpzStationHotspotsError('INVALID_COORDS', 'ungültig'),
    )
    const res = await PATCH(
      request('PATCH', { cookie: SECRET, body: { x: 2 } }),
      routeContext,
    )
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ error: 'INVALID_COORDS' })
  })
})
