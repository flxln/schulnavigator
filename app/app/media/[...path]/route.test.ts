import { Readable } from 'node:stream'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resetAccessConfigCacheForTests } from '@/lib/access-config'
import {
  ACCESS_COOKIE,
  FEST_DEV_TOKEN,
  resetAccessTokensCacheForTests,
} from '@/lib/access-tokens'

const mockCookies = vi.fn()

vi.mock('next/headers', () => ({
  cookies: () => mockCookies(),
}))

vi.mock('@/lib/public-media-file', () => ({
  resolvePublicMediaFilePath: vi.fn(() => '/tmp/test-media.mp4'),
  publicMediaContentType: vi.fn(() => 'video/mp4'),
}))

vi.mock('node:fs', () => ({
  statSync: vi.fn(() => ({ size: 42 })),
  createReadStream: vi.fn(() => Readable.from([Buffer.alloc(42)])),
}))

import { GET } from './route'

describe('GET /media/[...path]', () => {
  const envSnapshot = { ...process.env }

  afterEach(() => {
    vi.useRealTimers()
    process.env = { ...envSnapshot }
    resetAccessConfigCacheForTests()
    resetAccessTokensCacheForTests()
    vi.clearAllMocks()
  })

  it('gibt 403 ohne gültiges Cookie wenn gated', async () => {
    mockCookies.mockResolvedValue({ get: () => undefined })
    const res = await GET(new Request('http://localhost/media/daz/video/x.mp4'), {
      params: Promise.resolve({ path: ['daz', 'video', 'x.mp4'] }),
    })
    expect(res.status).toBe(403)
  })

  it('liefert Datei mit private Cache bei gültigem Cookie', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01'))
    mockCookies.mockResolvedValue({
      get: (name: string) =>
        name === ACCESS_COOKIE ? { value: FEST_DEV_TOKEN } : undefined,
    })
    const res = await GET(new Request('http://localhost/media/daz/video/x.mp4'), {
      params: Promise.resolve({ path: ['daz', 'video', 'x.mp4'] }),
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toBe('private, max-age=3600')
  })
})
