import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { DELETE, PATCH } from './route'

const BASE = 'http://localhost:3000/api/mpz/stations/klassenzimmer/medien/demo-audio'
const SECRET = 'test-studio-secret'

function requestWithMethod(
  method: 'DELETE' | 'PATCH',
  opts?: { cookie?: string; body?: object },
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
  params: Promise.resolve({ slug: 'klassenzimmer', mediumId: 'demo-audio' }),
}

vi.mock('@/lib/mpz-station-medien', () => ({
  removeStationMedium: vi.fn(),
  patchStationMedium: vi.fn(),
  MpzStationMedienError: class MpzStationMedienError extends Error {
    readonly code: string
    constructor(code: string, message: string) {
      super(message)
      this.code = code
    }
  },
}))

import { patchStationMedium, removeStationMedium } from '@/lib/mpz-station-medien'

describe('DELETE /api/mpz/stations/[slug]/medien/[mediumId]', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    vi.mocked(removeStationMedium).mockReset()
    vi.mocked(patchStationMedium).mockReset()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await DELETE(requestWithMethod('DELETE', { cookie: SECRET }), routeContext)
    expect(res.status).toBe(404)
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await DELETE(requestWithMethod('DELETE'), routeContext)
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
    const res = await DELETE(requestWithMethod('DELETE', { cookie: SECRET }), routeContext)
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
    const res = await DELETE(requestWithMethod('DELETE', { cookie: SECRET }), routeContext)
    expect(res.status).toBe(422)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('HOTSPOT_REFERENCE')
  })
})

describe('PATCH /api/mpz/stations/[slug]/medien/[mediumId]', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    vi.mocked(patchStationMedium).mockReset()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await PATCH(
      requestWithMethod('PATCH', { cookie: SECRET, body: { untertitel: 'Neu' } }),
      routeContext,
    )
    expect(res.status).toBe(404)
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await PATCH(
      requestWithMethod('PATCH', { body: { untertitel: 'Neu' } }),
      routeContext,
    )
    expect(res.status).toBe(401)
  })

  it('ungültiger Body → 400 invalid_body', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await PATCH(
      requestWithMethod('PATCH', { cookie: SECRET, body: { videoSource: 'invalid' } }),
      routeContext,
    )
    expect(res.status).toBe(400)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('invalid_body')
  })

  it('Erfolg mit gemocktem patchStationMedium', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(patchStationMedium).mockResolvedValue({
      station: {
        slug: 'klassenzimmer',
        titel: 'K',
        beschreibung: 'B',
        medien: [
          {
            id: 'demo-audio',
            typ: 'audio',
            quelle: '/media/klassenzimmer/audio/x.mp3',
            untertitel: 'Neu',
          },
        ],
      },
      mtime: '2026-01-01T00:00:00.000Z',
    })
    const body = { untertitel: 'Neu' }
    const res = await PATCH(
      requestWithMethod('PATCH', { cookie: SECRET, body }),
      routeContext,
    )
    expect(res.status).toBe(200)
    expect(patchStationMedium).toHaveBeenCalledWith('klassenzimmer', 'demo-audio', body)
  })

  it('NOT_FOUND → 404', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const { MpzStationMedienError } = await import('@/lib/mpz-station-medien')
    vi.mocked(patchStationMedium).mockRejectedValue(
      new MpzStationMedienError('NOT_FOUND', 'fehlt'),
    )
    const res = await PATCH(
      requestWithMethod('PATCH', { cookie: SECRET, body: { untertitel: 'X' } }),
      routeContext,
    )
    expect(res.status).toBe(404)
  })

  it('FIELD_NOT_ALLOWED → 422', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const { MpzStationMedienError } = await import('@/lib/mpz-station-medien')
    vi.mocked(patchStationMedium).mockRejectedValue(
      new MpzStationMedienError('FIELD_NOT_ALLOWED', 'nicht erlaubt'),
    )
    const res = await PATCH(
      requestWithMethod('PATCH', { cookie: SECRET, body: { poster: '/x.jpg' } }),
      routeContext,
    )
    expect(res.status).toBe(422)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('FIELD_NOT_ALLOWED')
  })

  it('NO_FIELDS → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const { MpzStationMedienError } = await import('@/lib/mpz-station-medien')
    vi.mocked(patchStationMedium).mockRejectedValue(
      new MpzStationMedienError('NO_FIELDS', 'leer'),
    )
    const res = await PATCH(
      requestWithMethod('PATCH', { cookie: SECRET, body: { untertitel: 'X' } }),
      routeContext,
    )
    expect(res.status).toBe(400)
  })
})
