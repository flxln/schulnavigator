import { join } from 'node:path'
import { DEFAULT_DEPLOY_BRANCH, DEPLOY_CONTENT_TIMEOUT_MS } from '@/lib/mpz-deploy-constants'
import {
  DEFAULT_DEPLOY_MAX_BUFFER,
  runShellScript,
  type RunNpmScriptResult,
} from '@/lib/mpz-deploy-runner'
import { defaultAppRoot } from '@/lib/mpz-env-local'

export { DEFAULT_DEPLOY_BRANCH, DEPLOY_CONTENT_TIMEOUT_MS } from '@/lib/mpz-deploy-constants'

export type DeployContentMode = 'media-only' | 'full'

export class MpzDeployContentError extends Error {
  readonly code = 'VALIDATION' as const

  constructor(message: string) {
    super(message)
    this.name = 'MpzDeployContentError'
  }
}

export function resolveDeployBranch(env: NodeJS.ProcessEnv = process.env): string {
  const raw = env.DEPLOY_BRANCH?.trim()
  return raw && raw.length > 0 ? raw : DEFAULT_DEPLOY_BRANCH
}

export function validateDeployContentEnv(env: NodeJS.ProcessEnv = process.env): void {
  if (!env.DEPLOY_SSH?.trim()) {
    throw new MpzDeployContentError('DEPLOY_SSH ist nicht gesetzt.')
  }
}

export function buildDeployContentArgs(
  mode: DeployContentMode,
  prune = false,
): string[] {
  const args: string[] = []
  if (mode === 'media-only') {
    args.push('--media-only')
  }
  if (prune) {
    args.push('--prune')
  }
  return args
}

export type RunDeployContentOptions = {
  mode: DeployContentMode
  prune?: boolean
  appRoot?: string
  env?: NodeJS.ProcessEnv
}

export type RunDeployContentResult = RunNpmScriptResult & {
  mode: DeployContentMode
}

export async function runDeployContent(
  opts: RunDeployContentOptions,
): Promise<RunDeployContentResult> {
  const appRoot = opts.appRoot ?? defaultAppRoot()
  const env = opts.env ?? process.env

  validateDeployContentEnv(env)

  const scriptPath = join(appRoot, 'scripts', 'deploy-content.sh')
  const args = [scriptPath, ...buildDeployContentArgs(opts.mode, opts.prune ?? false)]

  const result = await runShellScript('bash', args, {
    timeoutMs: DEPLOY_CONTENT_TIMEOUT_MS,
    cwd: appRoot,
    env,
    maxBuffer: DEFAULT_DEPLOY_MAX_BUFFER,
  })

  return {
    ...result,
    mode: opts.mode,
  }
}
