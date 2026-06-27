import { ENTRY_QR_SPECS } from './access-token-constants.mjs'

/**
 * Hub-Modus für gedruckte Entry-QRs kommt aus ENTRY_QR_SPECS (Code),
 * nicht aus SN_ACCESS_TOKENS.mode — Post-Fest: fest-Token-String → heft-Hub.
 *
 * @param {ReadonlyArray<{ token: string; mode: string; expiresAt: string }>} tokens
 * @param {typeof ENTRY_QR_SPECS} [specs]
 */
export function applyEntryQrHubModes(tokens, specs = ENTRY_QR_SPECS) {
  return tokens.map((entry) => {
    const spec = specs.find((s) => s.token === entry.token)
    if (!spec) {
      return entry
    }
    return { ...entry, mode: spec.mode }
  })
}
