import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { POST } from './route'

const BASE = 'http://localhost:3000/api/mpz/view/flat'
const SECRET = 'test-studio-secret'

function postRequest(
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
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

vi.mock('@/lib/mpz-view-ingest', () => ({
  applyFlatStartPan: vi.fn(),
  MpzViewIngestError: class MpzViewIngestError extends Error {
    readonly code: string
    constructor(code: string, message: string) {
      super(message)
      this.code = code
    }
  },
}))

import { applyFlatStartPan, MpzViewIngestError } from '@/lib/mpz-view-ingest'

describe('POST /api/mpz/view/flat', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(applyFlatStartPan).mockReset()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await POST(
      postRequest({ slug: 'kunst', startPanX: 0.5 }, { cookie: SECRET }),
    )
    expect(res.status).toBe(404)
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await POST(postRequest({ slug: 'kunst', startPanX: 0.5 }))
    expect(res.status).toBe(401)
  })

  it('fehlende Felder → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await POST(postRequest({ slug: 'kunst' }, { cookie: SECRET }))
    expect(res.status).toBe(400)
  })

  it('startPanX 0 ist gültig → 201', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(applyFlatStartPan).mockResolvedValue({ slug: 'kunst', startPanX: 0 })

    const res = await POST(
      postRequest({ slug: 'kunst', startPanX: 0 }, { cookie: SECRET }),
    )
    expect(res.status).toBe(201)
    expect(applyFlatStartPan).toHaveBeenCalledWith({ slug: 'kunst', startPanX: 0 })
    await expect(res.json()).resolves.toEqual({ slug: 'kunst', startPanX: 0 })
  })

  it('Happy-Path → 201 mit normalisiertem Wert', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(applyFlatStartPan).mockResolvedValue({ slug: 'kunst', startPanX: 0.4523 })

    const res = await POST(
      postRequest({ slug: 'kunst', startPanX: 0.45234 }, { cookie: SECRET }),
    )
    expect(res.status).toBe(201)
    await expect(res.json()).resolves.toEqual({ slug: 'kunst', startPanX: 0.4523 })
  })

  it('Sphere-Station → 422 VALIDATION', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(applyFlatStartPan).mockRejectedValue(
      new MpzViewIngestError('VALIDATION', 'Station "daz" ist kein Flat-Viewer.'),
    )

    const res = await POST(
      postRequest({ slug: 'daz', startPanX: 0.5 }, { cookie: SECRET }),
    )
    expect(res.status).toBe(422)
    await expect(res.json()).resolves.toMatchObject({ error: 'VALIDATION' })
  })

  it('unbekannter slug → 422 VALIDATION', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(applyFlatStartPan).mockRejectedValue(
      new MpzViewIngestError('VALIDATION', 'Unbekannter slug "nicht-da".'),
    )

    const res = await POST(
      postRequest({ slug: 'nicht-da', startPanX: 0.5 }, { cookie: SECRET }),
    )
    expect(res.status).toBe(422)
    await expect(res.json()).resolves.toMatchObject({ error: 'VALIDATION' })
  })
})
