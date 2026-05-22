/**
 * Vergleicht gs39-tokens.css mit der Auftraggeber-Quelle.
 * Docker-Build-Kontext ist nur app/ — siehe dokumentation/build-kontext-submodule-regeln.md
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = join(__dirname, '..')
const appTokensPath = join(appRoot, 'app', 'gs39-tokens.css')

const SOURCE_CANDIDATES = [
  join(
    appRoot,
    '..',
    'auftraggeber',
    'material',
    'UI-Vorschläge',
    'colors_and_type.css',
  ),
  join(appRoot, 'scripts', 'reference', 'colors_and_type.css'),
]

function resolveSourceTokensPath() {
  for (const path of SOURCE_CANDIDATES) {
    if (existsSync(path)) return path
  }
  throw new Error(
    `Keine Quell-CSS gefunden. Erwartet eine von:\n${SOURCE_CANDIDATES.map((p) => `  ${p}`).join('\n')}`,
  )
}

const sourceTokensPath = resolveSourceTokensPath()

const SKIP_COMPARE = new Set(['font-ui'])

function extractRootVars(css) {
  const start = css.indexOf(':root')
  if (start === -1) {
    throw new Error('Kein :root-Block gefunden')
  }
  const brace = css.indexOf('{', start)
  let depth = 0
  let i = brace
  for (; i < css.length; i++) {
    if (css[i] === '{') depth++
    if (css[i] === '}') {
      depth--
      if (depth === 0) {
        i++
        break
      }
    }
  }
  const block = css.slice(brace + 1, i - 1)
  const vars = new Map()
  const re = /--([\w-]+)\s*:\s*([^;]+);/g
  let m
  while ((m = re.exec(block)) !== null) {
    const name = m[1].trim()
    const val = m[2].trim().replace(/\s+/g, ' ')
    vars.set(name, val)
  }
  return vars
}

function normalizeValue(v) {
  let s = v.replace(/\s+/g, ' ').trim()
  s = s.replace(/#([0-9A-Fa-f]{3,8})\b/g, (_, hex) => `#${hex.toLowerCase()}`)
  s = s.replace(
    /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/gi,
    (_, r, g, b, a) =>
      `rgba(${Number(r)},${Number(g)},${Number(b)},${parseFloat(a)})`,
  )
  s = s.replace(/\b1\.20\b/g, '1.2')
  s = s.replace(/cubic-bezier\(\s*([^)]+)\)/i, (_, inner) => {
    const parts = inner.split(',').map((x) => String(parseFloat(x.trim())))
    return `cubic-bezier(${parts.join(',')})`
  })
  return s
}

let failed = false
try {
  const sourceCss = readFileSync(sourceTokensPath, 'utf8')
  const appCss = readFileSync(appTokensPath, 'utf8')
  const sourceVars = extractRootVars(sourceCss)
  const appVars = extractRootVars(appCss)

  for (const [name, sourceVal] of sourceVars) {
    if (SKIP_COMPARE.has(name)) continue
    const appVal = appVars.get(name)
    if (appVal === undefined) {
      console.error(`validate:tokens — fehlt in app/gs39-tokens.css: --${name}`)
      failed = true
      continue
    }
    if (normalizeValue(appVal) !== normalizeValue(sourceVal)) {
      console.error(
        `validate:tokens — Abweichung --${name}\n  Quelle: ${sourceVal}\n  App:    ${appVal}`,
      )
      failed = true
    }
  }
} catch (e) {
  console.error('validate:tokens:', e.message)
  process.exit(1)
}

if (failed) {
  console.error('\nvalidate:tokens fehlgeschlagen.')
  process.exit(1)
}

console.log(
  'validate:tokens OK — gs39-tokens.css stimmt mit colors_and_type.css überein.',
)
