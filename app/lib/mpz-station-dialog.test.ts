import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import raw from '@/data/stations.json'
import {
  createMpzContentIo,
  resetMpzWriteLockForTests,
  serializeStationsFile,
} from '@/lib/mpz-content-io'
import {
  addDialogGruppe,
  addDialogSegment,
  createDialog,
  MpzStationDialogError,
  patchDialogMeta,
  patchDialogSegment,
  removeDialog,
  removeDialogGruppe,
  removeDialogSegment,
} from '@/lib/mpz-station-dialog'
import { addStationHotspot } from '@/lib/mpz-station-hotspots'
import * as mpzStationsValidation from '@/lib/mpz-stations-validation'
import { validateStationsFile } from '@/lib/validate-stations'
import type { StationsFile } from '@/lib/types'

const fixture = raw as StationsFile
const temps: string[] = []

function makeTempIo(initial: StationsFile = fixture) {
  const appRoot = mkdtempSync(join(tmpdir(), 'mpz-dialog-domain-'))
  temps.push(appRoot)
  const stationsPath = join(appRoot, 'data', 'stations.json')
  mkdirSync(join(appRoot, 'data'), { recursive: true })
  writeFileSync(stationsPath, serializeStationsFile(initial), 'utf8')
  const audioDir = join(appRoot, 'content', 'dialog-audio', 'daz')
  mkdirSync(audioDir, { recursive: true })
  for (let i = 1; i <= 9; i++) {
    const rolle = i % 2 === 1 ? 'frieda' : 'otto'
    if (i === 9) {
      writeFileSync(join(audioDir, '09-beide.wav'), 'x', 'utf8')
    } else {
      writeFileSync(
        join(audioDir, `${String(i).padStart(2, '0')}-${rolle}.wav`),
        'x',
        'utf8',
      )
    }
  }
  return createMpzContentIo({ appRoot, stationsPath, backupPath: `${stationsPath}.bak` })
}

function dazDialog(io: ReturnType<typeof makeTempIo>) {
  const data = JSON.parse(
    readFileSync(io.getPaths().stationsPath, 'utf8'),
  ) as StationsFile
  return data.stations.find((s) => s.slug === 'daz')!.dialog!
}

beforeEach(() => {
  vi.spyOn(mpzStationsValidation, 'validateStationsContent').mockReturnValue({
    structureErrors: [],
    assetErrors: [],
    warnings: [],
    bySlug: {},
  })
})

afterEach(() => {
  resetMpzWriteLockForTests()
  vi.restoreAllMocks()
  for (const dir of temps) {
    rmSync(dir, { recursive: true, force: true })
  }
  temps.length = 0
})

describe('patchDialogMeta', () => {
  it('aktualisiert figuren', async () => {
    const io = makeTempIo()
    const result = await patchDialogMeta('daz', { figuren: ['frieda', 'otto'] }, io)
    expect(result.station.dialog?.figuren).toEqual(['frieda', 'otto'])
  })

  it('aktualisiert figuren auf leerem Dialog-Entwurf', async () => {
    const custom = structuredClone(fixture) as StationsFile
    const kz = custom.stations.find((s) => s.slug === 'klassenzimmer')!
    kz.dialog = { figuren: ['frieda', 'otto'], segmente: [], gruppen: [] }
    const io = makeTempIo(custom)
    const result = await patchDialogMeta('klassenzimmer', { figuren: ['frieda'] }, io)
    expect(result.station.dialog?.figuren).toEqual(['frieda'])
  })

  it('wirft FIGURE_IN_USE wenn otto-Segment ohne otto in figuren', async () => {
    const io = makeTempIo()
    await expect(
      patchDialogMeta('daz', { figuren: ['frieda'] }, io),
    ).rejects.toMatchObject({ code: 'FIGURE_IN_USE' })
  })
})

describe('addDialogSegment', () => {
  it('hängt Segment mit auto-id an (Text-only ohne quelle)', async () => {
    const io = makeTempIo()
    const before = dazDialog(io).segmente.length
    const result = await addDialogSegment(
      'daz',
      { rolle: 'frieda', text: 'Neu' },
      io,
    )
    expect(result.station.dialog?.segmente).toHaveLength(before + 1)
    const last = result.station.dialog!.segmente.at(-1)!
    expect(last.id).toMatch(/^d\d+$/)
    expect(last.quelle).toBeUndefined()
  })

  it('hängt Audio-Segment mit quelle an', async () => {
    const io = makeTempIo()
    const before = dazDialog(io).segmente.length
    const result = await addDialogSegment(
      'daz',
      { rolle: 'frieda', text: 'Neu', hasAudio: true },
      io,
    )
    const last = result.station.dialog!.segmente.at(-1)!
    expect(last.quelle).toBe(`/api/dialog/daz/${String(before + 1).padStart(2, '0')}-frieda.wav`)
  })
})

describe('removeDialogSegment', () => {
  it('löscht Segment und renummeriert Clips', async () => {
    const io = makeTempIo()
    const dialog = dazDialog(io)
    const targetId = dialog.segmente[0]!.id
    const result = await removeDialogSegment('daz', targetId, io)
    expect(result.station.dialog?.segmente).toHaveLength(dialog.segmente.length - 1)
    expect(result.station.dialog?.segmente[0]?.quelle).toBe(
      '/api/dialog/daz/01-otto.wav',
    )
    const audioDir = join(io.getPaths().appRoot, 'content', 'dialog-audio', 'daz')
    expect(readFileSync(join(audioDir, '01-otto.wav'), 'utf8')).toBe('x')
  })

  it('wirft LAST_SEGMENT bei letztem Segment', async () => {
    const custom = structuredClone(fixture) as StationsFile
    const daz = custom.stations.find((s) => s.slug === 'daz')!
    daz.dialog!.segmente = [daz.dialog!.segmente[0]!]
    const io = makeTempIo(custom)
    await expect(
      removeDialogSegment('daz', daz.dialog!.segmente[0]!.id, io),
    ).rejects.toMatchObject({ code: 'LAST_SEGMENT' })
  })
})

describe('patchDialogSegment', () => {
  it('aktualisiert text', async () => {
    const io = makeTempIo()
    const id = dazDialog(io).segmente[0]!.id
    const result = await patchDialogSegment('daz', id, { text: 'Geändert' }, io)
    expect(result.station.dialog?.segmente[0]?.text).toBe('Geändert')
  })
})

describe('removeDialogGruppe', () => {
  it('wirft GROUP_IN_USE wenn referenziert', async () => {
    const io = makeTempIo()
    await expect(removeDialogGruppe('daz', 'gruesse', io)).rejects.toMatchObject({
      code: 'GROUP_IN_USE',
    })
  })

  it('löscht unbenutzte Gruppe', async () => {
    const custom = structuredClone(fixture) as StationsFile
    const daz = custom.stations.find((s) => s.slug === 'daz')!
    for (const seg of daz.dialog!.segmente) {
      delete seg.gruppe
    }
    daz.dialog!.gruppen = [{ id: 'test-gr', text: 'T' }]
    const io = makeTempIo(custom)
    const result = await removeDialogGruppe('daz', 'test-gr', io)
    expect(result.station.dialog?.gruppen?.some((g) => g.id === 'test-gr')).toBeFalsy()
  })
})

describe('createDialog', () => {
  it('legt minimalen Dialog-Block an', async () => {
    const io = makeTempIo()
    const result = await createDialog('klassenzimmer', io)
    expect(result.station.dialog).toEqual({
      figuren: ['frieda', 'otto'],
      segmente: [],
      gruppen: [],
    })
  })

  it('wirft DIALOG_EXISTS wenn Block existiert', async () => {
    const io = makeTempIo()
    await expect(createDialog('daz', io)).rejects.toMatchObject({ code: 'DIALOG_EXISTS' })
  })
})

describe('removeDialog', () => {
  it('entfernt Dialog-Block', async () => {
    const custom = structuredClone(fixture) as StationsFile
    const kz = custom.stations.find((s) => s.slug === 'klassenzimmer')!
    kz.dialog = { figuren: ['frieda', 'otto'], segmente: [], gruppen: [] }
    const io = makeTempIo(custom)
    const result = await removeDialog('klassenzimmer', io)
    expect(result.station.dialog).toBeUndefined()
  })

  it('wirft DIALOG_IN_USE bei Dialog-Hotspot', async () => {
    const io = makeTempIo()
    await expect(removeDialog('daz', io)).rejects.toMatchObject({ code: 'DIALOG_IN_USE' })
  })

  it('wirft NO_DIALOG wenn kein Block', async () => {
    const io = makeTempIo()
    await expect(removeDialog('klassenzimmer', io)).rejects.toMatchObject({ code: 'NO_DIALOG' })
  })
})

describe('dialog lifecycle E2E', () => {
  it('klassenzimmer: anlegen → Segment → Dialog-Hotspot → validate', async () => {
    const io = makeTempIo()
    await createDialog('klassenzimmer', io)
    await addDialogSegment('klassenzimmer', { rolle: 'frieda', text: 'Hallo' }, io)
    await addStationHotspot(
      'klassenzimmer',
      {
        action: 'dialog',
        id: 'hs-dialog-kz',
        mascot: 'frieda',
        yaw: 10,
        pitch: 0,
      },
      io,
    )
    const data = JSON.parse(
      readFileSync(io.getPaths().stationsPath, 'utf8'),
    ) as StationsFile
    expect(() => validateStationsFile(data)).not.toThrow()
    const kz = data.stations.find((s) => s.slug === 'klassenzimmer')!
    expect(kz.dialog?.segmente).toHaveLength(1)
    expect(kz.hotspots360?.some((h) => h.action === 'dialog')).toBe(true)
  })
})

describe('MpzStationDialogError', () => {
  it('ist Instanz von Error', () => {
    const err = new MpzStationDialogError('NOT_FOUND', 'x')
    expect(err).toBeInstanceOf(Error)
    expect(err.code).toBe('NOT_FOUND')
  })
})
