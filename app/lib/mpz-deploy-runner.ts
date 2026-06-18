import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { defaultAppRoot } from '@/lib/mpz-env-local'

const execFileAsync = promisify(execFile)

export const QR_MANIFEST_SENTINEL = '__QR_MANIFEST_JSON__='
export const DEFAULT_DEPLOY_MAX_BUFFER = 32 * 1024 * 1024
export const DEFAULT_OUTPUT_TRUNCATE_BYTES = 32 * 1024

export type MpzDeployRunnerErrorCode = 'SPAWN' | 'TIMEOUT'

export class MpzDeployRunnerError extends Error {
  readonly code: MpzDeployRunnerErrorCode

  constructor(code: MpzDeployRunnerErrorCode, message: string) {
    super(message)
    this.name = 'MpzDeployRunnerError'
    this.code = code
  }
}

export type RunNpmScriptResult = {
  exitCode: number
  stdout: string
  stderr: string
}

export type RunNpmScriptOptions = {
  cwd?: string
  timeoutMs?: number
  maxBuffer?: number
}

function defaultTimeoutMs(scriptName: string): number {
  if (scriptName === 'test') return 120_000
  if (scriptName === 'rotate:access-tokens') return 180_000
  return 60_000
}

export function truncateDeployOutput(
  text: string,
  maxBytes: number = DEFAULT_OUTPUT_TRUNCATE_BYTES,
): string {
  const buf = Buffer.from(text, 'utf8')
  if (buf.length <= maxBytes) {
    return text
  }
  return `${buf.subarray(0, maxBytes).toString('utf8')}\n… (gekürzt)`
}

export function extractQrManifestFromStdout(stdout: string): unknown | null {
  for (const line of stdout.split(/\r?\n/)) {
    if (line.startsWith(QR_MANIFEST_SENTINEL)) {
      try {
        return JSON.parse(line.slice(QR_MANIFEST_SENTINEL.length)) as unknown
      } catch {
        return null
      }
    }
  }
  return null
}

export function extractCoolifyJsonFromStdout(stdout: string): string | null {
  const lines = stdout.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (line.includes('SN_ACCESS_TOKENS:')) {
      const inline = line.split('SN_ACCESS_TOKENS:')[1]?.trim()
      if (inline?.startsWith('[')) {
        return inline
      }
      const next = lines[i + 1]?.trim()
      if (next?.startsWith('[')) {
        return next
      }
    }
  }
  return null
}

export async function runNpmScript(
  scriptName: string,
  args: string[] = [],
  opts: RunNpmScriptOptions = {},
): Promise<RunNpmScriptResult> {
  const cwd = opts.cwd ?? defaultAppRoot()
  const timeout = opts.timeoutMs ?? defaultTimeoutMs(scriptName)
  const maxBuffer = opts.maxBuffer ?? DEFAULT_DEPLOY_MAX_BUFFER
  const npmArgs = ['run', scriptName, ...(args.length > 0 ? ['--', ...args] : [])]

  try {
    const { stdout, stderr } = await execFileAsync('npm', npmArgs, {
      cwd,
      timeout,
      maxBuffer,
      encoding: 'utf8',
    })
    return {
      exitCode: 0,
      stdout: stdout ?? '',
      stderr: stderr ?? '',
    }
  } catch (err: unknown) {
    if (err && typeof err === 'object') {
      const e = err as {
        code?: number | string
        stdout?: string
        stderr?: string
        killed?: boolean
        signal?: string
        message?: string
      }
      if (e.killed || e.signal === 'SIGTERM') {
        throw new MpzDeployRunnerError('TIMEOUT', `Subprocess-Timeout (${scriptName})`)
      }
      if (typeof e.code === 'number') {
        return {
          exitCode: e.code,
          stdout: e.stdout ?? '',
          stderr: e.stderr ?? '',
        }
      }
    }
    throw new MpzDeployRunnerError(
      'SPAWN',
      err instanceof Error ? err.message : 'Subprocess konnte nicht gestartet werden.',
    )
  }
}
