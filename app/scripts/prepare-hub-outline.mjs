/**
 * Extrahiert Ebene_2_-_Outline aus der Referenz-SVG (nur app/, kein Submodule).
 * Manuell: npm run prepare:hub-outline — nicht Teil von build/prebuild.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SOURCE = join(ROOT, 'scripts/reference/outline-39gs-frontansicht.svg')
const TARGET = join(ROOT, 'public/brand/hub/gs39-front-outline.svg')
const EXPECTED_VIEWBOX = '0 0 1086.5 1453.9'

function extractGroup(svg, groupId) {
  const open = `<g id="${groupId}">`
  const start = svg.indexOf(open)
  if (start === -1) {
    throw new Error(`Gruppe "${groupId}" nicht gefunden in ${SOURCE}`)
  }
  let depth = 0
  let i = start
  while (i < svg.length) {
    if (svg.startsWith('<g', i) && (svg[i + 2] === ' ' || svg[i + 2] === '>')) {
      depth += 1
    } else if (svg.startsWith('</g>', i)) {
      depth -= 1
      if (depth === 0) {
        return svg.slice(start, i + 4)
      }
    }
    i += 1
  }
  throw new Error(`Schließendes </g> für "${groupId}" nicht gefunden`)
}

function assertViewBox(svg) {
  const m = svg.match(/viewBox="([^"]+)"/)
  if (!m) throw new Error('viewBox fehlt in Quell-SVG')
  const vb = m[1].trim()
  const ok =
    vb === EXPECTED_VIEWBOX ||
    vb === '0 0 1086.5 1453.89' ||
    vb === '0 0 1086.5 1453.899'
  if (!ok) {
    throw new Error(
      `viewBox "${vb}" weicht ab — erwartet ${EXPECTED_VIEWBOX}. Slot-Frames neu vermessen.`,
    )
  }
}

function extractStyles(svg) {
  const m = svg.match(/<style>([\s\S]*?)<\/style>/)
  return m ? m[1].trim() : ''
}

const source = readFileSync(SOURCE, 'utf8')
assertViewBox(source)
const outline = extractGroup(source, 'Ebene_2_-_Outline')
const styles = extractStyles(source)

const output = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${EXPECTED_VIEWBOX}" role="img" aria-hidden="true">
${styles ? `<defs><style>${styles}</style></defs>` : ''}
${outline}
</svg>
`

mkdirSync(dirname(TARGET), { recursive: true })
writeFileSync(TARGET, output, 'utf8')
console.log(`Geschrieben: ${TARGET} (${output.length} Zeichen)`)
