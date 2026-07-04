import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  buildDeployContentArgs,
  MpzDeployContentError,
  resolveDeployBranch,
  runDeployContent,
  validateDeployContentEnv,
} from '@/lib/mpz-deploy-content'
import { DEFAULT_DEPLOY_BRANCH } from '@/lib/mpz-deploy-constants'

vi.mock('@/lib/mpz-deploy-runner', () => ({
  DEFAULT_DEPLOY_MAX_BUFFER: 32 * 1024 * 1024,
  runShellScript: vi.fn(),
}))

import { runShellScript } from '@/lib/mpz-deploy-runner'

describe('validateDeployContentEnv', () => {
  it('wirft wenn DEPLOY_SSH fehlt', () => {
    expect(() => validateDeployContentEnv({})).toThrow(MpzDeployContentError)
    expect(() => validateDeployContentEnv({ DEPLOY_SSH: '  ' })).toThrow(
      'DEPLOY_SSH ist nicht gesetzt.',
    )
  })

  it('akzeptiert gesetztes DEPLOY_SSH', () => {
    expect(() =>
      validateDeployContentEnv({ DEPLOY_SSH: 'admin@ionos-vps.example' }),
    ).not.toThrow()
  })
})

describe('resolveDeployBranch', () => {
  it('nutzt Default kunde/39-gs', () => {
    expect(resolveDeployBranch({})).toBe(DEFAULT_DEPLOY_BRANCH)
  })

  it('liest DEPLOY_BRANCH aus Env', () => {
    expect(resolveDeployBranch({ DEPLOY_BRANCH: 'main' })).toBe('main')
  })
})

describe('buildDeployContentArgs', () => {
  it('full ohne Flags', () => {
    expect(buildDeployContentArgs('full')).toEqual([])
  })

  it('media-only', () => {
    expect(buildDeployContentArgs('media-only')).toEqual(['--media-only'])
  })

  it('prune ergänzt --prune', () => {
    expect(buildDeployContentArgs('full', true)).toEqual(['--prune'])
    expect(buildDeployContentArgs('media-only', true)).toEqual([
      '--media-only',
      '--prune',
    ])
  })
})

describe('runDeployContent', () => {
  afterEach(() => {
    vi.mocked(runShellScript).mockReset()
  })

  it('ruft bash mit Skript und Env auf', async () => {
    vi.mocked(runShellScript).mockResolvedValue({
      exitCode: 0,
      stdout: 'ok',
      stderr: '',
    })

    const env = { DEPLOY_SSH: 'admin@ionos-vps.example' }
    const result = await runDeployContent({ mode: 'media-only', env })

    expect(result.ok).toBeUndefined()
    expect(result.exitCode).toBe(0)
    expect(result.mode).toBe('media-only')
    expect(runShellScript).toHaveBeenCalledWith(
      'bash',
      expect.arrayContaining(['--media-only']),
      expect.objectContaining({
        timeoutMs: 900_000,
        env,
        maxBuffer: 32 * 1024 * 1024,
      }),
    )
    const args = vi.mocked(runShellScript).mock.calls[0]?.[1] ?? []
    expect(args[0]).toContain('scripts/deploy-content.sh')
    expect(args).toContain('--media-only')
  })

  it('bricht vor Spawn ab wenn DEPLOY_SSH fehlt', async () => {
    await expect(runDeployContent({ mode: 'full', env: {} })).rejects.toThrow(
      MpzDeployContentError,
    )
    expect(runShellScript).not.toHaveBeenCalled()
  })
})
