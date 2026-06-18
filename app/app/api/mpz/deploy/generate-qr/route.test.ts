import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { POST } from './route'

const BASE = 'http://localhost:3000/api/mpz/deploy/generate-qr'
const SECRET = 'test-studio-secret'

vi.mock('@/lib/mpz-env-local', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/mpz-env-local')>()
  return {
    ...actual,
    requireDeployBaseUrl: vi.fn(),
  }
})

vi.mock('@/lib/mpz-deploy-runner', () => ({
  runNpmScript: vi.fn(),
  truncateDeployOutput: (s: string) => s,
  extractQrManifestFromStdout: vi.fn(() => ({ rooms: [] })),
  MpzDeployRunnerError: class MpzDeployRunnerError extends Error {
    readonly code = 'SPAWN'
  },
}))

import { MpzEnvLocalError, requireDeployBaseUrl } from '@/lib/mpz-env-local'
import { runNpmScript } from '@/lib/mpz-deploy-runner'

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

describe('POST /api/mpz/deploy/generate-qr', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(requireDeployBaseUrl).mockReset()
    vi.mocked(runNpmScript).mockReset()
  })

  it('fehlende BASE_URL → 422', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(requireDeployBaseUrl).mockImplementation(() => {
      throw new MpzEnvLocalError('VALIDATION', 'fehlt')
    })
    const res = await POST(post({ dryRun: true }, SECRET))
    expect(res.status).toBe(422)
    expect((await res.json()).error).toBe('VALIDATION')
  })

  it('dry-run → 200 in-band bei exitCode 1', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(requireDeployBaseUrl).mockReturnValue('https://schulnavigator.mpz.schule')
    vi.mocked(runNpmScript).mockResolvedValue({
      exitCode: 1,
      stdout: 'fail',
      stderr: 'err',
    })
    const res = await POST(post({ dryRun: true }, SECRET))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(false)
    expect(json.exitCode).toBe(1)
  })
})
