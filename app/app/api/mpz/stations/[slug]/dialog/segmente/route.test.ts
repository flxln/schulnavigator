import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { POST, parseCreate } from './route'

const BASE = 'http://localhost:3000/api/mpz/stations/daz/dialog/segmente'
const SECRET = 'test-studio-secret'
const routeContext = { params: Promise.resolve({ slug: 'daz' }) }

vi.mock('@/lib/mpz-station-dialog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/mpz-station-dialog')>()
  return { ...actual, addDialogSegment: vi.fn() }
})

import { addDialogSegment } from '@/lib/mpz-station-dialog'

describe('parseCreate dialog segment', () => {
  it('parst rolle', () => {
    expect(parseCreate({ rolle: 'frieda', text: 'Hi' })).toEqual({
      rolle: 'frieda',
      text: 'Hi',
    })
  })

  it('parst hasAudio', () => {
    expect(parseCreate({ rolle: 'otto', text: 'Hi', hasAudio: true })).toEqual({
      rolle: 'otto',
      text: 'Hi',
      hasAudio: true,
    })
  })

  it('lehnt fehlende rolle ab', () => {
    expect(parseCreate({ text: 'Hi' })).toBeNull()
  })
})

describe('POST /api/mpz/stations/[slug]/dialog/segmente', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(addDialogSegment).mockReset()
  })

  it('legt Segment an', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(addDialogSegment).mockResolvedValue({
      station: { slug: 'daz' } as never,
      mtime: '2026-01-01T00:00:00.000Z',
    })

    const res = await POST(
      new NextRequest(new URL(BASE), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: `${MPZ_STUDIO_COOKIE}=${SECRET}`,
        },
        body: JSON.stringify({ rolle: 'frieda' }),
      }),
      routeContext,
    )
    expect(res.status).toBe(200)
  })
})
