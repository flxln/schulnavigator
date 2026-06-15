#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  assertEntryQrSync,
  parseAccessTokensJson,
} from './validate-access-shared.mjs'
import { loadEnvLocal } from './load-env-local.mjs'
import {
  buildAccessTokensPayload,
  generateEntryToken,
  parseRotateArgs,
  renderAccessTokenConstants,
  resolveRotationTargets,
} from './rotate-access-token-utils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = join(__dirname, '..')
const constantsPath = join(appRoot, 'lib', 'access-token-constants.mjs')

function fail(msg) {
  console.error(`rotate:access-tokens — ${msg}`)
  process.exit(1)
}

function printChecklist() {
  console.log(`
Manuell:
  1. SN_ACCESS_TOKENS in Coolify Prod + Dev setzen (VOR Deploy)
  2. git add lib/access-token-constants.mjs public/qr/manifest.json public/qr/manifest-schulfest.json
  3. Commit, Push, Deploy
  4. Entry-QRs aus public/qr/pdf/ drucken (alte Tokens verbrannt)
`)
}

async function main() {
  let opts
  try {
    opts = parseRotateArgs(process.argv.slice(2))
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e))
  }

  const current = await import('../lib/access-token-constants.mjs')

  const tokenFactory = (mode) =>
    generateEntryToken(mode, undefined, opts.entropyBytes)

  let targets
  try {
    targets = resolveRotationTargets(opts, current, tokenFactory)
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e))
  }

  const { fest, heft, festExpires, heftExpires } = targets
  const payload = buildAccessTokensPayload({
    fest,
    heft,
    festExpires,
    heftExpires,
  })

  let constantsSource
  try {
    constantsSource = renderAccessTokenConstants({
      fest,
      heft,
      festExpires,
      heftExpires,
    })
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e))
  }

  const coolifyJson = JSON.stringify(payload)

  console.log('rotate:access-tokens')
  console.log('')
  console.log('Neue Tokens:')
  console.log(`  fest: ${fest}  (expires ${festExpires})`)
  console.log(`  heft: ${heft}  (expires ${heftExpires})`)
  console.log('')
  console.log('Coolify (Prod + Dev) — SN_ACCESS_TOKENS:')
  console.log(coolifyJson)
  console.log('')

  if (opts.dryRun) {
    console.log('[dry-run] Keine Dateien geändert, keine Subcommands.')
    printChecklist()
    return
  }

  writeFileSync(constantsPath, constantsSource, 'utf8')
  console.log(`Geschrieben: ${constantsPath}`)

  try {
    const parsed = parseAccessTokensJson(coolifyJson)
    const specs = [
      { file: 'entry-fest.png', token: fest, mode: 'fest' },
      { file: 'entry-heft.png', token: heft, mode: 'heft' },
    ]
    assertEntryQrSync(parsed, specs)
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e))
  }

  if (!opts.noTest) {
    console.log('\n[rotate] npm run test …')
    execSync('npm run test', { cwd: appRoot, stdio: 'inherit' })
  }

  if (!opts.noQr) {
    loadEnvLocal(appRoot)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim()
    if (!baseUrl) {
      fail(
        'NEXT_PUBLIC_BASE_URL fehlt — in app/.env.local setzen (Produktions-Domain, ohne trailing slash)',
      )
    }

    console.log('\n[rotate] npm run generate:qr …')
    execSync('npm run generate:qr', { cwd: appRoot, stdio: 'inherit' })
    console.log('\n[rotate] npm run generate:qr -- --preset=schulfest …')
    execSync('npm run generate:qr -- --preset=schulfest', {
      cwd: appRoot,
      stdio: 'inherit',
    })
  }

  console.log('\nrotate:access-tokens OK')
  printChecklist()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
