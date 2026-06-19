import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = join(__dirname, '..')
const dataDir = join(appRoot, 'data')

const ACCENT_HEX_RE = /^#[0-9a-f]{6}$/i
const LUCIDE_NAMES = new Set([
  'BookOpen',
  'GraduationCap',
  'Hammer',
  'HeartHandshake',
  'Home',
  'Languages',
  'Monitor',
  'Music',
  'Palette',
  'PersonStanding',
  'Trees',
  'UtensilsCrossed',
])

const HUB_SLOTS = {
  portal: { kind: 'portal' },
  'fenster-ul-2': { kind: 'fenster' },
  'fenster-ul-1': { kind: 'fenster' },
  'fenster-uc-l': { kind: 'fenster' },
  'fenster-uc-r': { kind: 'fenster' },
  'fenster-ur-1': { kind: 'fenster' },
  'fenster-ur-2': { kind: 'fenster' },
  'fenster-ll': { kind: 'fenster' },
  'fenster-lc': { kind: 'fenster' },
  'fenster-rc': { kind: 'fenster' },
  'fenster-lr': { kind: 'deko' },
  'wegweiser-oben': { kind: 'wegweiser' },
  'wegweiser-unten': { kind: 'wegweiser' },
  'deko-dach': { kind: 'deko' },
  'deko-vestibuel': { kind: 'deko' },
  'deko-fluegel-l': { kind: 'deko' },
  'deko-fluegel-r': { kind: 'deko' },
}

function fail(msg) {
  console.error(`validate:hub-config: ${msg}`)
  process.exitCode = 1
}

function readJson(path, label) {
  if (!existsSync(path)) {
    fail(`fehlende Datei ${path}`)
    return null
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (err) {
    fail(`${label}: ungültiges JSON — ${err instanceof Error ? err.message : String(err)}`)
    return null
  }
}

function isAssignableSlotId(slotId) {
  const slot = HUB_SLOTS[slotId]
  return slot !== undefined && slot.kind !== 'deko'
}

function validateHubSlugMap(parsed) {
  if (typeof parsed !== 'object' || parsed === null) {
    fail('hub-slug-map.json: Root muss ein Objekt sein')
    return
  }
  const mappings = parsed.mappings
  if (typeof mappings !== 'object' || mappings === null || Array.isArray(mappings)) {
    fail('hub-slug-map.json: mappings muss ein Objekt sein')
    return
  }
  const entries = Object.entries(mappings)
  if (entries.length !== 12) {
    fail(`hub-slug-map.json: erwartet 12 Einträge, erhalten ${entries.length}`)
  }
  const slotIds = new Set()
  const nrs = new Set()
  for (const [slug, mapping] of entries) {
    if (typeof mapping !== 'object' || mapping === null) {
      fail(`hub-slug-map.json: mappings["${slug}"] kein Objekt`)
      continue
    }
    if (!mapping.slotId || !(mapping.slotId in HUB_SLOTS)) {
      fail(`hub-slug-map.json: mappings["${slug}"] ungültige slotId`)
    } else if (!isAssignableSlotId(mapping.slotId)) {
      fail(`hub-slug-map.json: mappings["${slug}"] slotId nicht zuweisbar`)
    } else if (slotIds.has(mapping.slotId)) {
      fail(`hub-slug-map.json: doppelter slotId "${mapping.slotId}"`)
    } else {
      slotIds.add(mapping.slotId)
    }
    if (!Number.isInteger(mapping.nr) || mapping.nr < 1 || mapping.nr > 12) {
      fail(`hub-slug-map.json: mappings["${slug}"] ungültige nr`)
    } else if (nrs.has(mapping.nr)) {
      fail(`hub-slug-map.json: doppelte nr ${mapping.nr}`)
    } else {
      nrs.add(mapping.nr)
    }
  }
}

function validateAccents(parsed) {
  if (typeof parsed !== 'object' || parsed === null) {
    fail('station-accents.json: Root muss ein Objekt sein')
    return
  }
  const accents = parsed.accents
  if (typeof accents !== 'object' || accents === null || Array.isArray(accents)) {
    fail('station-accents.json: accents muss ein Objekt sein')
    return
  }
  for (const [slug, hex] of Object.entries(accents)) {
    if (typeof hex !== 'string' || !ACCENT_HEX_RE.test(hex)) {
      fail(`station-accents.json: accents["${slug}"] ungültiges Hex`)
    }
  }
}

function validateIcons(parsed) {
  if (typeof parsed !== 'object' || parsed === null) {
    fail('station-icons.json: Root muss ein Objekt sein')
    return
  }
  const icons = parsed.icons
  if (typeof icons !== 'object' || icons === null || Array.isArray(icons)) {
    fail('station-icons.json: icons muss ein Objekt sein')
    return
  }
  for (const [slug, icon] of Object.entries(icons)) {
    if (typeof icon !== 'object' || icon === null) {
      fail(`station-icons.json: icons["${slug}"] kein Objekt`)
      continue
    }
    if (icon.type !== 'lucide') {
      fail(`station-icons.json: icons["${slug}"] type muss "lucide" sein`)
    } else if (typeof icon.name !== 'string' || !LUCIDE_NAMES.has(icon.name)) {
      fail(`station-icons.json: icons["${slug}"] unbekannter Lucide-Name`)
    }
  }
}

const hubMap = readJson(join(dataDir, 'hub-slug-map.json'), 'hub-slug-map.json')
const accents = readJson(join(dataDir, 'station-accents.json'), 'station-accents.json')
const icons = readJson(join(dataDir, 'station-icons.json'), 'station-icons.json')

if (hubMap) validateHubSlugMap(hubMap)
if (accents) validateAccents(accents)
if (icons) validateIcons(icons)

if (process.exitCode === 1) {
  process.exit(1)
}

console.log('validate:hub-config OK (hub-slug-map, station-accents, station-icons)')
