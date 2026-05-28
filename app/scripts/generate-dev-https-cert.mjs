#!/usr/bin/env node
/**
 * mkcert-Zertifikat für localhost + LAN-IPs aus .env.local (ALLOWED_DEV_ORIGINS).
 * Ohne passende SANs blockiert Safari auf dem iPhone „Website öffnen“.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, '..')
const certDir = path.join(appRoot, 'certificates')
const keyFile = path.join(certDir, 'localhost-key.pem')
const certFile = path.join(certDir, 'localhost.pem')

function loadLanIps() {
  const envPath = path.join(appRoot, '.env.local')
  if (!fs.existsSync(envPath)) {
    return []
  }
  const raw = fs.readFileSync(envPath, 'utf8')
  const match = raw.match(/^ALLOWED_DEV_ORIGINS=(.+)$/m)
  if (!match) {
    return []
  }
  return match[1]
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^\d{1,3}(\.\d{1,3}){3}$/.test(s))
}

const lanIps = loadLanIps()
const names = ['localhost', '127.0.0.1', '::1', ...lanIps]

fs.mkdirSync(certDir, { recursive: true })

function resolveMkcert() {
  const candidates = [
    'mkcert',
    '/opt/homebrew/bin/mkcert',
    '/usr/local/bin/mkcert',
  ]
  for (const bin of candidates) {
    try {
      execSync(`"${bin}" -version`, { stdio: 'ignore' })
      return bin
    } catch {
      /* next */
    }
  }
  return null
}

const mkcert = resolveMkcert()
if (!mkcert) {
  console.error(
    'mkcert fehlt. Install: brew install mkcert && mkcert -install\n' +
      'Dann erneut: npm run cert:lan',
  )
  process.exit(1)
}

const args = [
  mkcert,
  '-key-file',
  keyFile,
  '-cert-file',
  certFile,
  ...names,
]

console.log('Erzeuge Dev-Zertifikat für:', names.join(', '))
execSync(args.join(' '), { stdio: 'inherit', cwd: appRoot })
console.log('OK:', certFile)
