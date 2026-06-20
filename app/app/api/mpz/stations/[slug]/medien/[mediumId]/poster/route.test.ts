import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { POST } from './route'

const BASE_AUDIO =
  'http://localhost:3000/api/mpz/stations/klassenzimmer/medien/demo-audio/poster'
const BASE_VIDEO =
  'http://localhost:3000/api/mpz/stations/klassenzimmer/medien/demo-video/poster'
const SECRET = 'test-studio-secret'

function postRequest(
  url: string,
  form: FormData,
  opts?: { cookie?: string },
): NextRequest {
  const headers: Record<string, string> = {}
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(url), { method: 'POST', headers, body: form })
}

vi.mock('@/lib/mpz-medium-asset-upload', () => ({
  uploadStationMediumAsset: vi.fn(),
}))

import { uploadStationMediumAsset } from '@/lib/mpz-medium-asset-upload'
import { MpzStationMedienError } from '@/lib/mpz-station-medien'

describe('POST /api/mpz/stations/[slug]/medien/[mediumId]/poster', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(uploadStationMediumAsset).mockReset()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const form = new FormData()
    form.set('file', new File([Buffer.from('x')], 'x.jpg'))
    const res = await POST(
      postRequest(BASE_VIDEO, form, { cookie: SECRET }),
      { params: Promise.resolve({ slug: 'klassenzimmer', mediumId: 'demo-video' }) },
    )
    expect(res.status).toBe(404)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('NOT_FOUND')
  })

  it('FIELD_NOT_ALLOWED auf audio → 422', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(uploadStationMediumAsset).mockRejectedValue(
      new MpzStationMedienError('FIELD_NOT_ALLOWED', 'poster nur für video'),
    )
    const form = new FormData()
    form.set('file', new File([Buffer.from('x')], 'x.jpg'))
    const res = await POST(
      postRequest(BASE_AUDIO, form, { cookie: SECRET }),
      { params: Promise.resolve({ slug: 'klassenzimmer', mediumId: 'demo-audio' }) },
    )
    expect(res.status).toBe(422)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('FIELD_NOT_ALLOWED')
  })

  it('YouTube-Video → 200', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(uploadStationMediumAsset).mockResolvedValue({
      medium: {
        id: 'demo-video',
        typ: 'video',
        quelle: 'https://www.youtube.com/watch?v=demo',
        videoSource: 'youtube',
        poster: '/media/klassenzimmer/fotos/poster.jpg',
      },
      field: 'poster',
      path: '/media/klassenzimmer/fotos/poster.jpg',
      previousPath: null,
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
    form.set('file', new File([Buffer.from('x')], 'poster.jpg'))
    const res = await POST(
      postRequest(BASE_VIDEO, form, { cookie: SECRET }),
      { params: Promise.resolve({ slug: 'klassenzimmer', mediumId: 'demo-video' }) },
    )
    expect(res.status).toBe(200)
    const json = (await res.json()) as {
      field: string
      path: string
      medium: { videoSource?: string; poster?: string }
    }
    expect(json.field).toBe('poster')
    expect(json.path).toBe('/media/klassenzimmer/fotos/poster.jpg')
    expect(json.medium.videoSource).toBe('youtube')
    expect(json.medium.poster).toBe(json.path)
  })
})
