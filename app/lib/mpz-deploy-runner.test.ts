import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  extractCoolifyJsonFromStdout,
  extractQrManifestFromStdout,
  MpzDeployRunnerError,
  QR_MANIFEST_SENTINEL,
  runNpmScript,
  runShellScript,
  truncateDeployOutput,
} from '@/lib/mpz-deploy-runner'

const execFileMock = vi.hoisted(() => vi.fn())

vi.mock('node:child_process', () => ({
  execFile: execFileMock,
}))

vi.mock('node:util', () => ({
  promisify: () => execFileMock,
}))

describe('truncateDeployOutput', () => {
  it('kürzt lange Ausgaben', () => {
    const long = 'x'.repeat(40_000)
    const out = truncateDeployOutput(long, 100)
    expect(out).toContain('… (gekürzt)')
    expect(Buffer.byteLength(out, 'utf8')).toBeLessThan(long.length)
  })
})

describe('extractQrManifestFromStdout', () => {
  it('liest Sentinel-Zeile', () => {
    const manifest = { generatedAt: '2026-01-01', rooms: [] }
    const stdout = `[QR] Dry-Run\n${QR_MANIFEST_SENTINEL}${JSON.stringify(manifest)}\npreview`
    expect(extractQrManifestFromStdout(stdout)).toEqual(manifest)
  })
})

describe('extractCoolifyJsonFromStdout', () => {
  it('liest JSON nach SN_ACCESS_TOKENS-Zeile', () => {
    const json = '[{"token":"fest-x","mode":"fest"}]'
    const stdout = `rotate:access-tokens\nCoolify (Prod + Dev) — SN_ACCESS_TOKENS:\n${json}\n`
    expect(extractCoolifyJsonFromStdout(stdout)).toBe(json)
  })
})

describe('runNpmScript', () => {
  afterEach(() => {
    execFileMock.mockReset()
  })

  it('gibt Exit-Code 0 bei Erfolg zurück', async () => {
    execFileMock.mockResolvedValue({ stdout: 'ok', stderr: '' })
    const result = await runNpmScript('validate:tokens')
    expect(result.exitCode).toBe(0)
    expect(execFileMock).toHaveBeenCalledWith(
      'npm',
      ['run', 'validate:tokens'],
      expect.objectContaining({ encoding: 'utf8' }),
    )
  })

  it('mappt npm-Fehler auf exitCode', async () => {
    execFileMock.mockRejectedValue({
      code: 1,
      stdout: 'fail stdout',
      stderr: 'fail stderr',
    })
    const result = await runNpmScript('validate:coach')
    expect(result.exitCode).toBe(1)
    expect(result.stdout).toBe('fail stdout')
  })

  it('wirft bei Timeout', async () => {
    execFileMock.mockRejectedValue({ killed: true, signal: 'SIGTERM' })
    await expect(runNpmScript('test')).rejects.toBeInstanceOf(MpzDeployRunnerError)
  })
})

describe('runShellScript', () => {
  afterEach(() => {
    execFileMock.mockReset()
  })

  it('übergibt explizite timeoutMs, cwd, env und maxBuffer', async () => {
    execFileMock.mockResolvedValue({ stdout: 'sync ok', stderr: '' })
    const env = { DEPLOY_SSH: 'admin@example.test', PATH: '/usr/bin' }
    const result = await runShellScript('bash', ['/tmp/deploy.sh'], {
      timeoutMs: 900_000,
      cwd: '/app',
      env,
      maxBuffer: 1024,
    })
    expect(result.exitCode).toBe(0)
    expect(execFileMock).toHaveBeenCalledWith(
      'bash',
      ['/tmp/deploy.sh'],
      expect.objectContaining({
        timeout: 900_000,
        cwd: '/app',
        env,
        maxBuffer: 1024,
        encoding: 'utf8',
      }),
    )
  })

  it('mappt Exit-Code ≠ 0', async () => {
    execFileMock.mockRejectedValue({ code: 1, stdout: '', stderr: 'fail' })
    const result = await runShellScript('bash', ['script.sh'], {
      timeoutMs: 60_000,
      cwd: '/app',
      env: process.env,
      maxBuffer: 1024,
    })
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toBe('fail')
  })
})
