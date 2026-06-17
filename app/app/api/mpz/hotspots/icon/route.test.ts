import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { POST } from './route'

const BASE = 'http://localhost:3000/api/mpz/hotspots/icon'
const SECRET = 'test-studio-secret'

function postRequest(form: FormData, opts?: { cookie?: string }): NextRequest {
  const headers: Record<string, string> = {}
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(BASE), { method: 'POST', headers, body: form })
}

vi.mock('@/lib/mpz-hotspot-icon-ingest', () => ({
  ingestHotspotIcon: vi.fn(),
}))

import { ingestHotspotIcon } from '@/lib/mpz-hotspot-icon-ingest'

describe('POST /api/mpz/hotspots/icon', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(ingestHotspotIcon).mockReset()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('slug', 'hort')
    form.set('file', new File([Buffer.from('<svg></svg>')], 'a.svg'))
    const res = await POST(postRequest(form, { cookie: SECRET }))
    expect(res.status).toBe(404)
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('slug', 'hort')
    form.set('file', new File([Buffer.from('<svg></svg>')], 'a.svg'))
    const res = await POST(postRequest(form))
    expect(res.status).toBe(401)
  })

  it('Erfolg mit gemocktem ingestHotspotIcon', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(ingestHotspotIcon).mockResolvedValue({
      path: '/media/hort/icons/play.svg',
      filename: 'play.svg',
      destPath: '/tmp/play.svg',
    })
    const form = new FormData()
    form.set('slug', 'hort')
    form.set('file', new File([Buffer.from('<svg></svg>')], 'play.svg'))
    const res = await POST(postRequest(form, { cookie: SECRET }))
    expect(res.status).toBe(201)
    await expect(res.json()).resolves.toMatchObject({
      path: '/media/hort/icons/play.svg',
      filename: 'play.svg',
    })
  })

  it('fehlendes file-Feld → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('slug', 'hort')
    const res = await POST(postRequest(form, { cookie: SECRET }))
    expect(res.status).toBe(400)
  })
})
