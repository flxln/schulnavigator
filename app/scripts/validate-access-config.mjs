import {
  parseAccessTokensJson,
  parseEmbedAncestors,
} from './validate-access-shared.mjs'

function fail(msg) {
  console.error(`validate:access-config — ${msg}`)
  process.exit(1)
}

const tokensRaw = process.env.SN_ACCESS_TOKENS?.trim()
if (tokensRaw) {
  try {
    parseAccessTokensJson(tokensRaw)
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e))
  }
}

const ancestorsRaw = process.env.SN_EMBED_ANCESTORS
if (ancestorsRaw?.trim()) {
  try {
    parseEmbedAncestors(ancestorsRaw)
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e))
  }
}

console.log('validate:access-config OK')
