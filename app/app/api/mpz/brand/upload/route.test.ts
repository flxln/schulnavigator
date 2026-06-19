import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { POST } from './route'

const BASE = 'http://localhost:3000/api/mpz/brand/upload'
const SECRET = 'test-studio-secret'

function postRequest(form: FormData, opts?: { cookie?: string }): NextRequest {
  const headers: Record<string, string> = {}
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(BASE), { method: 'POST', headers, body: form })
}

vi.mock('@/lib/mpz-brand-ingest', () => ({
  ingestBrandAsset: vi.fn(),
}))

import { ingestBrandAsset } from '@/lib/mpz-brand-ingest'

describe('POST /api/mpz/brand/upload', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(ingestBrandAsset).mockReset()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('slot', 'logo-badge')
    form.set('file', new File([Buffer.from('<svg></svg>')], 'a.svg'))
    const res = await POST(postRequest(form, { cookie: SECRET }))
    expect(res.status).toBe(404)
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('slot', 'logo-badge')
    form.set('file', new File([Buffer.from('<svg></svg>')], 'a.svg'))
    const res = await POST(postRequest(form))
    expect(res.status).toBe(401)
  })

  it('Erfolg mit gemocktem ingestBrandAsset inkl. mtime', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(ingestBrandAsset).mockResolvedValue({
      path: '/brand/logos/badge.svg',
      filename: 'badge.svg',
      mtime: '2026-06-20T12:00:00.000Z',
      destPath: '/tmp/badge.svg',
    })
    const form = new FormData()
    form.set('slot', 'logo-badge')
    form.set('file', new File([Buffer.from('<svg></svg>')], 'badge.svg'))
    const res = await POST(postRequest(form, { cookie: SECRET }))
    expect(res.status).toBe(201)
    await expect(res.json()).resolves.toMatchObject({
      path: '/brand/logos/badge.svg',
      filename: 'badge.svg',
      mtime: '2026-06-20T12:00:00.000Z',
    })
  })

  it('fehlendes file-Feld → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('slot', 'logo-badge')
    const res = await POST(postRequest(form, { cookie: SECRET }))
    expect(res.status).toBe(400)
  })

  it('unbekannter Slot → 400 MISSING_FIELDS', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('slot', 'not-a-slot')
    form.set('file', new File([Buffer.from('<svg></svg>')], 'a.svg'))
    const res = await POST(postRequest(form, { cookie: SECRET }))
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ error: 'MISSING_FIELDS' })
  })

  it('Datei zu groß → 422 vor ingestBrandAsset', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const big = new Uint8Array(512 * 1024 + 1)
    const form = new FormData()
    form.set('slot', 'logo-badge')
    form.set('file', new File([big], 'big.svg'))
    const res = await POST(postRequest(form, { cookie: SECRET }))
    expect(res.status).toBe(422)
    expect(ingestBrandAsset).not.toHaveBeenCalled()
  })
})
