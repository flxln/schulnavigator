import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { POST } from './route'

const BASE = 'http://localhost:3000/api/mpz/media/ingest'
const SECRET = 'test-studio-secret'

function postRequest(form: FormData, opts?: { cookie?: string }): NextRequest {
  const headers: Record<string, string> = {}
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(BASE), { method: 'POST', headers, body: form })
}

describe('POST /api/mpz/media/ingest', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('production → 404 (Dev-only-Guard), auch mit gültigem Cookie', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('slug', 'klassenzimmer')
    form.set('typ', 'video')
    form.set('file', new File([Buffer.from('x')], 'clip.mp4'))
    const res = await POST(postRequest(form, { cookie: SECRET }))
    expect(res.status).toBe(404)
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('slug', 'klassenzimmer')
    form.set('typ', 'video')
    form.set('file', new File([Buffer.from('x')], 'clip.mp4'))
    const res = await POST(postRequest(form))
    expect(res.status).toBe(401)
  })

  it('Fake-PDF als .mp4 → 422 (Magic-Byte-Validierung, kein Disk-Write)', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const pdf = Buffer.concat([
      Buffer.from('%PDF-1.7\n'),
      Buffer.alloc(64),
    ])
    const form = new FormData()
    form.set('slug', 'klassenzimmer')
    form.set('typ', 'video')
    form.set('file', new File([pdf], 'fake.mp4', { type: 'application/pdf' }))
    const res = await POST(postRequest(form, { cookie: SECRET }))
    expect(res.status).toBe(422)
    await expect(res.json()).resolves.toMatchObject({ error: 'VALIDATION' })
  })

  it('unbekannter typ → 422', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('slug', 'klassenzimmer')
    form.set('typ', 'gif')
    form.set('file', new File([Buffer.from('x')], 'anim.gif'))
    const res = await POST(postRequest(form, { cookie: SECRET }))
    expect(res.status).toBe(422)
  })

  it('fehlendes file-Feld → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('slug', 'klassenzimmer')
    form.set('typ', 'video')
    const res = await POST(postRequest(form, { cookie: SECRET }))
    expect(res.status).toBe(400)
  })
})
