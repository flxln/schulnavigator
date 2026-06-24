const FALLBACK_PRINTED_QR_BASE = 'https://39-gs.mpz.schule'

/** Origins gedruckter QRs (NEXT_PUBLIC_BASE_URL), zusätzlich zur laufenden App-Origin. */
export function getTrustedScanOrigins(): readonly string[] {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL?.trim()
  const base = (fromEnv || FALLBACK_PRINTED_QR_BASE).replace(/\/+$/, '')
  return [base]
}
