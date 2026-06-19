import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = join(__dirname, '..')
const allowlistPath = join(appRoot, 'data', 'embed-allowlist.json')

const EMBED_SUFFIX_RE = /^[a-z0-9]([a-z0-9-]*\.)+[a-z0-9-]+$/

function fail(msg) {
  console.error(`validate:embed-allowlist: ${msg}`)
  process.exitCode = 1
}

function isValidEmbedSuffix(raw) {
  const trimmed = raw.trim()
  if (!trimmed) return false
  if (trimmed.includes('/') || trimmed.includes(':') || /\s/.test(trimmed)) {
    return false
  }
  return EMBED_SUFFIX_RE.test(trimmed.toLowerCase())
}

if (!existsSync(allowlistPath)) {
  fail(`fehlende Datei ${allowlistPath}`)
  process.exit(1)
}

let parsed
try {
  parsed = JSON.parse(readFileSync(allowlistPath, 'utf8'))
} catch (err) {
  fail(`ungültiges JSON — ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
}

if (typeof parsed !== 'object' || parsed === null) {
  fail('Root muss ein Objekt sein')
  process.exit(1)
}

const suffixes = parsed.suffixes
if (!Array.isArray(suffixes)) {
  fail('suffixes muss ein Array sein')
  process.exit(1)
}

if (suffixes.length === 0) {
  fail('suffixes darf nicht leer sein')
  process.exit(1)
}

const seen = new Set()
for (const [index, entry] of suffixes.entries()) {
  if (typeof entry !== 'string') {
    fail(`suffixes[${index}] muss ein String sein`)
    continue
  }
  if (!isValidEmbedSuffix(entry)) {
    fail(`suffixes[${index}] "${entry}" ist kein gültiges Domain-Suffix`)
    continue
  }
  const normalized = entry.trim().toLowerCase()
  if (seen.has(normalized)) {
    fail(`doppeltes Suffix "${normalized}"`)
  } else {
    seen.add(normalized)
  }
}

if (process.exitCode === 1) {
  process.exit(1)
}

console.log(`validate:embed-allowlist OK (${suffixes.length} Suffixe)`)
