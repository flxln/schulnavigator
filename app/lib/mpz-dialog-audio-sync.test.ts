import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  applyQuellenAfterSync,
  clipFromQuelle,
  MpzDialogAudioSyncError,
  planDialogAudioRenames,
  syncDialogAudioFiles,
} from '@/lib/mpz-dialog-audio-sync'
import type { DialogSegment } from '@/lib/types'

const temps: string[] = []

function makeAppRoot(): string {
  const appRoot = mkdtempSync(join(tmpdir(), 'mpz-dialog-sync-'))
  temps.push(appRoot)
  return appRoot
}

function audioDir(appRoot: string, slug: string): string {
  const dir = join(appRoot, 'content', 'dialog-audio', slug)
  mkdirSync(dir, { recursive: true })
  return dir
}

function touchWav(appRoot: string, slug: string, clip: string, tag = 'x'): void {
  writeFileSync(join(audioDir(appRoot, slug), clip), tag, 'utf8')
}

function seg(
  id: string,
  rolle: DialogSegment['rolle'],
  quelle: string,
): DialogSegment {
  return { id, rolle, quelle, text: 't' }
}

afterEach(() => {
  for (const dir of temps) {
    rmSync(dir, { recursive: true, force: true })
  }
  temps.length = 0
})

describe('planDialogAudioRenames', () => {
  it('mappt Index-Shift nach Delete', () => {
    const before = [
      seg('d1', 'frieda', '/api/dialog/daz/01-frieda.wav'),
      seg('d2', 'otto', '/api/dialog/daz/02-otto.wav'),
      seg('d3', 'frieda', '/api/dialog/daz/03-frieda.wav'),
    ]
    const after = [before[1]!, before[2]!]
    const map = planDialogAudioRenames(before, after)
    expect(map.get('02-otto.wav')).toBe('01-otto.wav')
    expect(map.get('03-frieda.wav')).toBe('02-frieda.wav')
  })

  it('mappt rolle-Wechsel am gleichen Index', () => {
    const before = [
      seg('d1', 'otto', '/api/dialog/daz/01-otto.wav'),
    ]
    const after = [seg('d1', 'frieda', '/api/dialog/daz/01-frieda.wav')]
    const map = planDialogAudioRenames(before, after)
    expect(map.get('01-otto.wav')).toBe('01-frieda.wav')
  })
})

describe('syncDialogAudioFiles', () => {
  it('benennt Dateien bei Delete um', async () => {
    const appRoot = makeAppRoot()
    const slug = 'daz'
    touchWav(appRoot, slug, '01-frieda.wav', 'a')
    touchWav(appRoot, slug, '02-otto.wav', 'b')
    touchWav(appRoot, slug, '03-frieda.wav', 'c')

    const before = [
      seg('d1', 'frieda', '/api/dialog/daz/01-frieda.wav'),
      seg('d2', 'otto', '/api/dialog/daz/02-otto.wav'),
      seg('d3', 'frieda', '/api/dialog/daz/03-frieda.wav'),
    ]
    const after = [before[1]!, before[2]!]

    await syncDialogAudioFiles(slug, before, after, appRoot)

    const dir = audioDir(appRoot, slug)
    expect(existsSync(join(dir, '01-frieda.wav'))).toBe(false)
    expect(readFile(join(dir, '01-otto.wav'))).toBe('b')
    expect(readFile(join(dir, '02-frieda.wav'))).toBe('c')
  })

  it('wirft AUDIO_SYNC_FAILED wenn Zieldatei bereits existiert', async () => {
    const appRoot = makeAppRoot()
    const slug = 'daz'
    touchWav(appRoot, slug, '01-otto.wav', 'old')
    touchWav(appRoot, slug, '01-frieda.wav', 'orphan')

    const before = [seg('d1', 'otto', '/api/dialog/daz/01-otto.wav')]
    const after = [seg('d1', 'frieda', '/api/dialog/daz/01-frieda.wav')]

    await expect(syncDialogAudioFiles(slug, before, after, appRoot)).rejects.toBeInstanceOf(
      MpzDialogAudioSyncError,
    )
    expect(readFile(join(audioDir(appRoot, slug), '01-otto.wav'))).toBe('old')
    expect(readFile(join(audioDir(appRoot, slug), '01-frieda.wav'))).toBe('orphan')
  })

  it('ignoriert fehlende Quelldatei', async () => {
    const appRoot = makeAppRoot()
    const slug = 'daz'
    const before = [seg('d1', 'frieda', '/api/dialog/daz/01-frieda.wav')]
    const after = [seg('d1', 'otto', '/api/dialog/daz/01-otto.wav')]

    await expect(
      syncDialogAudioFiles(slug, before, after, appRoot),
    ).resolves.toBeUndefined()
  })
})

describe('applyQuellenAfterSync', () => {
  it('setzt quelle nach Konvention für Audio-Segmente', () => {
    const result = applyQuellenAfterSync('daz', [
      seg('d1', 'frieda', '/alt'),
      seg('d2', 'beide', '/alt2'),
    ])
    expect(result[0]?.quelle).toBe('/api/dialog/daz/01-frieda.wav')
    expect(result[1]?.quelle).toBe('/api/dialog/daz/02-beide.wav')
  })

  it('lässt Text-only-Segmente ohne quelle', () => {
    const result = applyQuellenAfterSync('lesewelt', [
      { id: 'l1', rolle: 'otto', text: 'Nur Text' },
      seg('d2', 'frieda', '/api/dialog/lesewelt/02-frieda.wav'),
    ])
    expect(result[0]?.quelle).toBeUndefined()
    expect(result[1]?.quelle).toBe('/api/dialog/lesewelt/02-frieda.wav')
  })
})

describe('clipFromQuelle', () => {
  it('parst Clip-Namen', () => {
    expect(clipFromQuelle('/api/dialog/daz/01-frieda.wav')).toBe('01-frieda.wav')
    expect(clipFromQuelle('/invalid')).toBeNull()
  })
})

function readFile(path: string): string {
  return readFileSync(path, 'utf8')
}
