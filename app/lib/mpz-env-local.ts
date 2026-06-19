import { existsSync, readFileSync } from 'node:fs'
import { rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeBaseUrl } from '@/lib/qr-urls'

export const DEPLOY_BASE_URL_KEY = 'NEXT_PUBLIC_BASE_URL'
export const DEPLOY_EMBED_KEY = 'NEXT_PUBLIC_EMBED_ENABLED'

export type MpzEnvLocalErrorCode = 'VALIDATION' | 'IO'

export class MpzEnvLocalError extends Error {
  readonly code: MpzEnvLocalErrorCode

  constructor(code: MpzEnvLocalErrorCode, message: string) {
    super(message)
    this.name = 'MpzEnvLocalError'
    this.code = code
  }
}

export type DeployEnvValues = {
  baseUrl: string | null
  embedEnabled: boolean
}

export function defaultAppRoot(): string {
  const libDir = dirname(fileURLToPath(import.meta.url))
  return join(libDir, '..')
}

export function validateBaseUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) {
    throw new MpzEnvLocalError('VALIDATION', 'NEXT_PUBLIC_BASE_URL darf nicht leer sein.')
  }
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new MpzEnvLocalError('VALIDATION', 'NEXT_PUBLIC_BASE_URL ist keine gültige URL.')
  }
  if (parsed.protocol !== 'https:') {
    throw new MpzEnvLocalError(
      'VALIDATION',
      'NEXT_PUBLIC_BASE_URL muss mit https:// beginnen.',
    )
  }
  return normalizeBaseUrl(trimmed)
}

function parseEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) {
    return {}
  }
  const text = readFileSync(filePath, 'utf8')
  const out: Record<string, string> = {}
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) {
      continue
    }
    const eq = line.indexOf('=')
    if (eq <= 0) {
      continue
    }
    const key = line.slice(0, eq).trim()
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      continue
    }
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

function readMergedDeployEnv(appRoot: string): DeployEnvValues {
  const merged = {
    ...parseEnvFile(join(appRoot, '.env')),
    ...parseEnvFile(join(appRoot, '.env.local')),
  }
  const baseUrl = merged[DEPLOY_BASE_URL_KEY]?.trim() || null
  const embedRaw = merged[DEPLOY_EMBED_KEY]?.trim().toLowerCase()
  return {
    baseUrl,
    embedEnabled: embedRaw === 'true',
  }
}

export function readDeployEnv(appRoot: string = defaultAppRoot()): DeployEnvValues {
  return readMergedDeployEnv(appRoot)
}

export function requireDeployBaseUrl(appRoot: string = defaultAppRoot()): string {
  const { baseUrl } = readDeployEnv(appRoot)
  if (!baseUrl) {
    throw new MpzEnvLocalError(
      'VALIDATION',
      'NEXT_PUBLIC_BASE_URL fehlt in .env.local — zuerst im Deploy-Tab setzen.',
    )
  }
  return validateBaseUrl(baseUrl)
}

function upsertEnvLines(
  lines: string[],
  updates: Record<string, string>,
): string[] {
  const updatedKeys = new Set<string>()
  const out = lines.map((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      return line
    }
    const eq = trimmed.indexOf('=')
    if (eq <= 0) {
      return line
    }
    const key = trimmed.slice(0, eq).trim()
    if (key in updates) {
      updatedKeys.add(key)
      return `${key}=${updates[key]}`
    }
    return line
  })

  for (const [key, value] of Object.entries(updates)) {
    if (!updatedKeys.has(key)) {
      if (out.length > 0 && out[out.length - 1] !== '') {
        out.push('')
      }
      out.push(`${key}=${value}`)
    }
  }

  return out
}

async function ensureEnvLocalFile(appRoot: string): Promise<string> {
  const localPath = join(appRoot, '.env.local')
  if (existsSync(localPath)) {
    return localPath
  }
  const examplePath = join(appRoot, '.env.example')
  const seed = existsSync(examplePath)
    ? readFileSync(examplePath, 'utf8')
    : `# MPZ Studio Deploy\n${DEPLOY_BASE_URL_KEY}=\n${DEPLOY_EMBED_KEY}=true\n`
  try {
    await writeFile(localPath, seed, 'utf8')
  } catch (err) {
    throw new MpzEnvLocalError(
      'IO',
      err instanceof Error ? err.message : '.env.local konnte nicht angelegt werden.',
    )
  }
  return localPath
}

export async function patchDeployEnv(
  patch: { baseUrl?: string; embedEnabled?: boolean },
  appRoot: string = defaultAppRoot(),
): Promise<DeployEnvValues> {
  if (patch.baseUrl === undefined && patch.embedEnabled === undefined) {
    throw new MpzEnvLocalError(
      'VALIDATION',
      'Mindestens eines von baseUrl oder embedEnabled ist erforderlich.',
    )
  }

  const updates: Record<string, string> = {}
  if (patch.baseUrl !== undefined) {
    updates[DEPLOY_BASE_URL_KEY] = validateBaseUrl(patch.baseUrl)
  }
  if (patch.embedEnabled !== undefined) {
    updates[DEPLOY_EMBED_KEY] = patch.embedEnabled ? 'true' : 'false'
  }

  const localPath = await ensureEnvLocalFile(appRoot)
  let content: string
  try {
    content = readFileSync(localPath, 'utf8')
  } catch (err) {
    throw new MpzEnvLocalError(
      'IO',
      err instanceof Error ? err.message : '.env.local konnte nicht gelesen werden.',
    )
  }

  const lines = content.length > 0 ? content.split(/\r?\n/) : []
  const nextContent = upsertEnvLines(lines, updates).join('\n')
  const tmpPath = `${localPath}.tmp`

  try {
    await writeFile(tmpPath, nextContent, 'utf8')
    await rename(tmpPath, localPath)
  } catch (err) {
    throw new MpzEnvLocalError(
      'IO',
      err instanceof Error ? err.message : '.env.local konnte nicht geschrieben werden.',
    )
  }

  return readDeployEnv(appRoot)
}
