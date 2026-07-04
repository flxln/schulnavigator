import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { POST } from './route'

const BASE = 'http://localhost:3000/api/mpz/deploy/sync-content'
const SECRET = 'test-studio-secret'

vi.mock('@/lib/mpz-deploy-content', () => ({
  MpzDeployContentError: class MpzDeployContentError extends Error {
    readonly code = 'VALIDATION'
    constructor(message: string) {
      super(message)
      this.name = 'MpzDeployContentError'
    }
  },
  runDeployContent: vi.fn(),
}))

vi.mock('@/lib/mpz-deploy-runner', () => ({
  truncateDeployOutput: (s: string) => s,
  MpzDeployRunnerError: class MpzDeployRunnerError extends Error {
    readonly code = 'TIMEOUT'
  },
}))

import { MpzDeployContentError, runDeployContent } from '@/lib/mpz-deploy-content'

function post(body: object, cookie?: string): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (cookie) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${cookie}`
  }
  return new NextRequest(new URL(BASE), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

describe('POST /api/mpz/deploy/sync-content', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(runDeployContent).mockReset()
  })

  it('lehnt ungültigen Body ab', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await POST(post({ mode: 'invalid' }, SECRET))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('INVALID_BODY')
  })

  it('gibt 422 wenn DEPLOY_SSH fehlt', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(runDeployContent).mockRejectedValue(
      new MpzDeployContentError('DEPLOY_SSH ist nicht gesetzt.'),
    )
    const res = await POST(post({ mode: 'media-only' }, SECRET))
    expect(res.status).toBe(422)
    const json = await res.json()
    expect(json.error).toBe('VALIDATION')
  })

  it('führt media-only aus und liefert exitCode', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(runDeployContent).mockResolvedValue({
      exitCode: 0,
      stdout: 'deploy-content: fertig.',
      stderr: '',
      mode: 'media-only',
    })
    const res = await POST(post({ mode: 'media-only' }, SECRET))
    expect(res.status).toBe(200)
    expect(runDeployContent).toHaveBeenCalledWith({ mode: 'media-only', prune: false })
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.mode).toBe('media-only')
  })

  it('mappt Skript-Fehler auf ok:false mit Status 200', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(runDeployContent).mockResolvedValue({
      exitCode: 1,
      stdout: '',
      stderr: 'rsync failed',
      mode: 'full',
    })
    const res = await POST(post({ mode: 'full' }, SECRET))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(false)
    expect(json.exitCode).toBe(1)
  })
})
