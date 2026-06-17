import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { POST } from './route'

const BASE = 'http://localhost:3000/api/mpz/dialog-audio/ingest'
const SECRET = 'test-studio-secret'

function postRequest(form: FormData, opts?: { cookie?: string }): NextRequest {
  const headers: Record<string, string> = {}
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(BASE), { method: 'POST', headers, body: form })
}

const WAV = Buffer.concat([
  Buffer.from('RIFF'),
  Buffer.from([0x24, 0, 0, 0]),
  Buffer.from('WAVEfmt '),
  Buffer.alloc(1016, 0x20),
])

describe('POST /api/mpz/dialog-audio/ingest', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('slug', 'daz')
    form.set('segmentIndex', '0')
    form.set('file', new File([WAV], 'clip.wav'))
    const res = await POST(postRequest(form, { cookie: SECRET }))
    expect(res.status).toBe(404)
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('slug', 'daz')
    form.set('segmentIndex', '0')
    form.set('file', new File([WAV], 'clip.wav'))
    const res = await POST(postRequest(form))
    expect(res.status).toBe(401)
  })

  it('fehlendes file-Feld → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('slug', 'daz')
    form.set('segmentIndex', '0')
    const res = await POST(postRequest(form, { cookie: SECRET }))
    expect(res.status).toBe(400)
  })
})
