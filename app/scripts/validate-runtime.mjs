import {
  assertEntryQrSync,
  parseAccessMode,
  parseAccessTokensJson,
  parseEmbedAncestors,
} from './validate-access-shared.mjs'

function fail(msg) {
  console.error(`validate:runtime — ${msg}`)
  process.exit(1)
}

const mode = parseAccessMode(process.env.SN_ACCESS_MODE)

if (process.env.SN_EMBED_ANCESTORS?.trim()) {
  try {
    parseEmbedAncestors(process.env.SN_EMBED_ANCESTORS)
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e))
  }
}

if (mode === 'open') {
  console.log('validate:runtime OK (SN_ACCESS_MODE=open)')
  process.exit(0)
}

const tokensRaw = process.env.SN_ACCESS_TOKENS?.trim()
if (!tokensRaw) {
  fail(
    'SN_ACCESS_MODE=gated erfordert SN_ACCESS_TOKENS in Production — Fail-closed (ADR-021). Coolify: Variable als Runtime (nicht nur Buildtime) setzen.',
  )
}

let tokens
try {
  tokens = parseAccessTokensJson(tokensRaw)
} catch (e) {
  fail(e instanceof Error ? e.message : String(e))
}

if (tokens.length === 0) {
  fail('SN_ACCESS_TOKENS darf in gated-Modus nicht leer sein')
}

try {
  assertEntryQrSync(tokens)
} catch (e) {
  fail(e instanceof Error ? e.message : String(e))
}

console.log('validate:runtime OK')
