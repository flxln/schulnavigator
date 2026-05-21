import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Liest `.env` und `.env.local` unter `appRoot` und setzt `process.env`
 * nur für Keys, die noch nicht gesetzt sind (Shell-Export hat Vorrang).
 * `.env.local` überschreibt dabei Werte aus `.env` in der Datei-Merge-Logik.
 *
 * @param {string} appRoot Absoluter Pfad zum `app/`-Verzeichnis
 */
export function loadEnvLocal(appRoot) {
  const merged = {
    ...parseEnvFile(join(appRoot, '.env')),
    ...parseEnvFile(join(appRoot, '.env.local')),
  }
  for (const [key, value] of Object.entries(merged)) {
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

/**
 * @param {string} filePath
 * @returns {Record<string, string>}
 */
function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {}
  }
  const text = readFileSync(filePath, 'utf8')
  /** @type {Record<string, string>} */
  const out = {}
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
