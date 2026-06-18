import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { POST } from './route'

const BASE = 'http://localhost:3000/api/mpz/stations/hort/raumbild'
const SECRET = 'test-studio-secret'

function postRequest(form: FormData, opts?: { cookie?: string }): NextRequest {
  const headers: Record<string, string> = {}
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(BASE), { method: 'POST', headers, body: form })
}

const routeContext = { params: Promise.resolve({ slug: 'hort' }) }

vi.mock('@/lib/mpz-station-raumbild-ingest', () => ({
  ingestStationRaumbild: vi.fn(),
}))

import { ingestStationRaumbild } from '@/lib/mpz-station-raumbild-ingest'

describe('POST /api/mpz/stations/[slug]/raumbild', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(ingestStationRaumbild).mockReset()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('variant', 'flat')
    form.set('file', new File([Buffer.from('x')], 'x.jpg'))
    const res = await POST(postRequest(form, { cookie: SECRET }), routeContext)
    expect(res.status).toBe(404)
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('variant', 'flat')
    form.set('file', new File([Buffer.from('x')], 'x.jpg'))
    const res = await POST(postRequest(form), routeContext)
    expect(res.status).toBe(401)
  })

  it('MISSING_FILE → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('variant', 'flat')
    const res = await POST(postRequest(form, { cookie: SECRET }), routeContext)
    expect(res.status).toBe(400)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('MISSING_FILE')
  })

  it('MISSING_FIELDS → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('file', new File([Buffer.from('x')], 'x.jpg'))
    const res = await POST(postRequest(form, { cookie: SECRET }), routeContext)
    expect(res.status).toBe(400)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('MISSING_FIELDS')
  })

  it('ungültiger variant → 422 VALIDATION', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('variant', 'sphere')
    form.set('file', new File([Buffer.from('x')], 'x.jpg'))
    const res = await POST(postRequest(form, { cookie: SECRET }), routeContext)
    expect(res.status).toBe(422)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('VALIDATION')
  })

  it('Erfolg mit gemocktem ingestStationRaumbild', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(ingestStationRaumbild).mockResolvedValue({
      station: { slug: 'hort', titel: 'Hort', beschreibung: 'x', medien: [], bild: '/stations/hort.jpg' },
      mtime: '2026-01-01T00:00:00.000Z',
      path: '/stations/hort.jpg',
      variant: 'flat',
      validation: {
        ok: true,
        checkedAt: '2026-01-01T00:00:00.000Z',
        durationMs: 1,
        errors: [],
        warnings: [],
        bySlug: {},
        stationSummaries: [],
        stationsModifiedAt: null,
      },
    })
    const form = new FormData()
    form.set('variant', 'flat')
    form.set('file', new File([Buffer.from('x')], 'x.jpg'))
    const res = await POST(postRequest(form, { cookie: SECRET }), routeContext)
    expect(res.status).toBe(200)
    expect(ingestStationRaumbild).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'hort', variant: 'flat', collision: 'reject' }),
    )
  })
})
