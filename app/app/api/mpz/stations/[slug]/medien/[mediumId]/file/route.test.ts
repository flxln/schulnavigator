import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { POST } from './route'

const BASE = 'http://localhost:3000/api/mpz/stations/klassenzimmer/medien/demo-audio/file'
const SECRET = 'test-studio-secret'

function postRequest(form: FormData, opts?: { cookie?: string }): NextRequest {
  const headers: Record<string, string> = {}
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(BASE), { method: 'POST', headers, body: form })
}

const routeContext = {
  params: Promise.resolve({ slug: 'klassenzimmer', mediumId: 'demo-audio' }),
}

vi.mock('@/lib/mpz-medium-replace', () => ({
  replaceStationMediumFile: vi.fn(),
}))

import { replaceStationMediumFile } from '@/lib/mpz-medium-replace'
import { MpzStationMedienError } from '@/lib/mpz-station-medien'

describe('POST /api/mpz/stations/[slug]/medien/[mediumId]/file', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(replaceStationMediumFile).mockReset()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('file', new File([Buffer.from('x')], 'x.mp3'))
    const res = await POST(postRequest(form, { cookie: SECRET }), routeContext)
    expect(res.status).toBe(404)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('NOT_FOUND')
    expect(json).not.toHaveProperty('message')
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('file', new File([Buffer.from('x')], 'x.mp3'))
    const res = await POST(postRequest(form), routeContext)
    expect(res.status).toBe(401)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('UNAUTHORIZED')
    expect(json).not.toHaveProperty('message')
  })

  it('MISSING_FILE → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    const res = await POST(postRequest(form, { cookie: SECRET }), routeContext)
    expect(res.status).toBe(400)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('MISSING_FILE')
  })

  it('NOT_FOUND aus Domain → 404', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(replaceStationMediumFile).mockRejectedValue(
      new MpzStationMedienError('NOT_FOUND', 'Medium fehlt'),
    )
    const form = new FormData()
    form.set('file', new File([Buffer.from('x')], 'x.mp3'))
    const res = await POST(postRequest(form, { cookie: SECRET }), routeContext)
    expect(res.status).toBe(404)
    const json = (await res.json()) as { error: string; message: string }
    expect(json.error).toBe('NOT_FOUND')
  })

  it('FIELD_NOT_ALLOWED (YouTube) → 422', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(replaceStationMediumFile).mockRejectedValue(
      new MpzStationMedienError('FIELD_NOT_ALLOWED', 'YouTube nicht erlaubt'),
    )
    const form = new FormData()
    form.set('file', new File([Buffer.from('x')], 'x.mp4'))
    const res = await POST(postRequest(form, { cookie: SECRET }), routeContext)
    expect(res.status).toBe(422)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('FIELD_NOT_ALLOWED')
  })

  it('Happy-Path → 200 mit Response-Feldern', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(replaceStationMediumFile).mockResolvedValue({
      medium: {
        id: 'demo-audio',
        typ: 'audio',
        quelle: '/media/klassenzimmer/audio/grundschule_demo.mp3',
      },
      quelle: '/media/klassenzimmer/audio/grundschule_demo.mp3',
      previousQuelle: '/media/klassenzimmer/audio/grundschule_demo.mp3',
      fileReplaced: true,
      previousFileDeleted: false,
      mtime: '2026-06-20T12:00:00.000Z',
      validation: {
        structureErrors: [],
        assetErrors: [],
        warnings: [],
        bySlug: {},
      },
    })
    const form = new FormData()
    form.set('file', new File([Buffer.from('x')], 'x.mp3'))
    const res = await POST(postRequest(form, { cookie: SECRET }), routeContext)
    expect(res.status).toBe(200)
    const json = (await res.json()) as {
      medium: { id: string }
      quelle: string
      previousQuelle: string
      fileReplaced: boolean
      previousFileDeleted: boolean
      mtime: string
    }
    expect(json.medium.id).toBe('demo-audio')
    expect(json.fileReplaced).toBe(true)
    expect(json.previousFileDeleted).toBe(false)
    expect(json.mtime).toBe('2026-06-20T12:00:00.000Z')
  })
})
