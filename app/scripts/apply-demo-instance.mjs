import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const MEDIA_EXT = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.mp4',
  '.mp3',
  '.wav',
  '.pdf',
])

const BRAND_FILES = [
  'public/brand/logos/jubilaeum-lockup.svg',
  'public/brand/logos/badge.svg',
]

function extname(name) {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot).toLowerCase()
}

function walkFiles(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walkFiles(path, out)
    else out.push(path)
  }
  return out
}

export function removeSchoolMedia(appRoot) {
  const roots = ['public/stations', 'public/demo', 'public/qr', 'public/media']
  for (const rel of roots) {
    for (const file of walkFiles(join(appRoot, rel))) {
      if (MEDIA_EXT.has(extname(file))) rmSync(file)
    }
  }
  for (const rel of BRAND_FILES) {
    const path = join(appRoot, rel)
    if (existsSync(path)) rmSync(path)
  }
}

export function applyDemoInstance(appRoot, env = process.env) {
  if (env.SN_INSTANCE !== 'demo') return { applied: false }
  if (env.APPLY_DEMO_INSTANCE !== '1') {
    throw new Error(
      'apply-demo-instance: SN_INSTANCE=demo ohne APPLY_DEMO_INSTANCE=1. Abbruch, damit Schuldateien nicht versehentlich ersetzt werden.',
    )
  }

  const seed = join(appRoot, 'demo-seed')
  const stationsSrc = join(seed, 'stations.json')
  const coachSrc = join(seed, 'coach-messages.json')
  if (!existsSync(stationsSrc) || !existsSync(coachSrc)) {
    throw new Error('apply-demo-instance: demo-seed ist unvollständig')
  }

  removeSchoolMedia(appRoot)
  mkdirSync(join(appRoot, 'data'), { recursive: true })
  mkdirSync(join(appRoot, 'content'), { recursive: true })
  cpSync(stationsSrc, join(appRoot, 'data', 'stations.json'))
  cpSync(coachSrc, join(appRoot, 'content', 'coach-messages.json'))

  const stations = JSON.parse(readFileSync(stationsSrc, 'utf8'))
  for (const station of stations.stations) {
    const image = join(seed, 'images', `${station.slug}.jpg`)
    if (!existsSync(image)) {
      throw new Error(`apply-demo-instance: Platzhalter fehlt für ${station.slug}`)
    }
    const target = join(appRoot, 'public', 'stations', `${station.slug}.jpg`)
    mkdirSync(dirname(target), { recursive: true })
    cpSync(image, target)

    const text = join(seed, 'texte', `${station.slug}.md`)
    if (!existsSync(text)) {
      throw new Error(`apply-demo-instance: Text fehlt für ${station.slug}`)
    }
    const textTarget = join(appRoot, 'public', 'media', station.slug, 'texte', 'beispiel.md')
    mkdirSync(dirname(textTarget), { recursive: true })
    cpSync(text, textTarget)
  }

  return { applied: true, stations: stations.stations.length }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isDirectRun) {
  const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
  const result = applyDemoInstance(appRoot)
  if (result.applied) {
    console.log(`apply-demo-instance: Demo-Seed eingesetzt (${result.stations} Stationen)`)
  } else {
    console.log('apply-demo-instance: übersprungen (SN_INSTANCE ist nicht demo)')
  }
}
