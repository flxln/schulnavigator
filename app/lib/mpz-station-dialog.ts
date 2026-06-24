import {
  createMpzContentIo,
  type MpzContentIo,
  withMpzWriteLock,
} from '@/lib/mpz-content-io'
import { buildClipName, dialogApiQuelle } from '@/lib/dialog-audio'
import {
  MAX_BUBBLE_FONT_SIZE,
  MAX_BUBBLE_MAX_WIDTH,
  MAX_BUBBLE_X,
  MAX_BUBBLE_Y,
  MIN_BUBBLE_FONT_SIZE,
  MIN_BUBBLE_MAX_WIDTH,
  MIN_BUBBLE_X,
  MIN_BUBBLE_Y,
} from '@/lib/dialog-bubble-layout'
import {
  applyQuellenAfterSync,
  MpzDialogAudioSyncError,
  syncDialogAudioFiles,
} from '@/lib/mpz-dialog-audio-sync'
import { isHubSlug } from '@/lib/schoolhouse-hub-map'
import type {
  DialogBubbleLayout,
  DialogBubbleTail,
  DialogFigure,
  DialogGruppe,
  DialogRolle,
  DialogSegment,
  Station,
  StationsFile,
} from '@/lib/types'

export type DialogErrorCode =
  | 'NOT_FOUND'
  | 'NO_DIALOG'
  | 'NO_FIELDS'
  | 'DUPLICATE_ID'
  | 'DIALOG_EXISTS'
  | 'DIALOG_IN_USE'
  | 'INVALID_ID'
  | 'INVALID_ROLLE'
  | 'INVALID_FIGUREN'
  | 'FIGURE_IN_USE'
  | 'INVALID_GRUPPE'
  | 'GROUP_IN_USE'
  | 'INVALID_TAIL'
  | 'INVALID_BUBBLE'
  | 'SEGMENT_LIMIT'
  | 'LAST_SEGMENT'
  | 'AUDIO_SYNC_FAILED'

export type DialogMetaPatch = {
  figuren?: DialogFigure[]
  bubble?: DialogBubbleLayout | null
}

export type AddDialogSegmentInput = {
  id?: string
  rolle: DialogRolle
  text?: string
  gruppe?: string
  tail?: DialogBubbleTail
  /** Default false — Segment ohne Audio (Text-only). */
  hasAudio?: boolean
}

export type PatchDialogSegmentInput = {
  text?: string
  gruppe?: string | null
  tail?: DialogBubbleTail | null
  rolle?: DialogRolle
  hasAudio?: boolean
}

export type AddDialogGruppeInput = {
  id: string
  text: string
}

export type PatchDialogGruppeInput = {
  text?: string
}

export type DialogWriteResult = {
  station: Station
  mtime: string | null
}

export class MpzStationDialogError extends Error {
  readonly code: DialogErrorCode

  constructor(code: DialogErrorCode, message: string) {
    super(message)
    this.name = 'MpzStationDialogError'
    this.code = code
  }
}

export const DIALOG_CLIENT_ERROR_CODES = new Set<DialogErrorCode>([
  'NO_FIELDS',
  'DUPLICATE_ID',
  'DIALOG_EXISTS',
  'DIALOG_IN_USE',
  'INVALID_ID',
  'INVALID_ROLLE',
  'INVALID_FIGUREN',
  'FIGURE_IN_USE',
  'INVALID_GRUPPE',
  'GROUP_IN_USE',
  'INVALID_TAIL',
  'INVALID_BUBBLE',
  'SEGMENT_LIMIT',
  'LAST_SEGMENT',
])

export function mapDialogError(
  err: MpzStationDialogError,
): { status: number; body: { error: string; message: string } } {
  if (err.code === 'NOT_FOUND' || err.code === 'NO_DIALOG') {
    return { status: 404, body: { error: err.code, message: err.message } }
  }
  if (err.code === 'AUDIO_SYNC_FAILED') {
    return { status: 500, body: { error: err.code, message: err.message } }
  }
  const status = DIALOG_CLIENT_ERROR_CODES.has(err.code) ? 400 : 500
  return { status, body: { error: err.code, message: err.message } }
}

const SEGMENT_ID_RE = /^[a-z0-9][a-z0-9-]*$/
const DIALOG_ROLLEN = new Set<DialogRolle>(['frieda', 'otto', 'beide'])
const DIALOG_TAILS = new Set<DialogBubbleTail>(['left', 'right', 'center'])
const DIALOG_FIGURES = new Set<DialogFigure>(['frieda', 'otto'])

function findHubStation(data: StationsFile, slug: string): Station {
  if (!isHubSlug(slug)) {
    throw new MpzStationDialogError('NOT_FOUND', `Unbekannter Hub-Slug "${slug}".`)
  }
  const station = data.stations.find((s) => s.slug === slug)
  if (!station) {
    throw new MpzStationDialogError(
      'NOT_FOUND',
      `Station "${slug}" fehlt in stations.json.`,
    )
  }
  return station
}

function requireDialogBlock(station: Station): NonNullable<Station['dialog']> {
  if (!station.dialog) {
    throw new MpzStationDialogError(
      'NO_DIALOG',
      `Station "${station.slug}" hat keinen Dialog.`,
    )
  }
  return station.dialog
}

function hasStationDialogHotspot(station: Station): boolean {
  const flat = station.hotspots?.some((h) => h.action === 'dialog') ?? false
  const sphere = station.hotspots360?.some((h) => h.action === 'dialog') ?? false
  return flat || sphere
}

function validateSegmentId(id: string): void {
  if (!id || !SEGMENT_ID_RE.test(id)) {
    throw new MpzStationDialogError(
      'INVALID_ID',
      `Segment-ID "${id}" ist ungültig (erwartet: Kleinbuchstaben, Ziffern, Bindestriche).`,
    )
  }
}

function validateGruppeId(id: string): void {
  if (!id || !SEGMENT_ID_RE.test(id)) {
    throw new MpzStationDialogError(
      'INVALID_ID',
      `Gruppen-ID "${id}" ist ungültig (erwartet: Kleinbuchstaben, Ziffern, Bindestriche).`,
    )
  }
}

function validateRolle(rolle: unknown): DialogRolle {
  if (typeof rolle !== 'string' || !DIALOG_ROLLEN.has(rolle as DialogRolle)) {
    throw new MpzStationDialogError(
      'INVALID_ROLLE',
      'rolle muss frieda, otto oder beide sein.',
    )
  }
  return rolle as DialogRolle
}

function validateTail(tail: unknown): DialogBubbleTail {
  if (typeof tail !== 'string' || !DIALOG_TAILS.has(tail as DialogBubbleTail)) {
    throw new MpzStationDialogError(
      'INVALID_TAIL',
      'tail muss left, right oder center sein.',
    )
  }
  return tail as DialogBubbleTail
}

function normalizeFiguren(raw: unknown): DialogFigure[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new MpzStationDialogError(
      'INVALID_FIGUREN',
      'figuren muss ein nicht-leeres Array sein.',
    )
  }
  const figuren: DialogFigure[] = []
  for (const entry of raw) {
    if (typeof entry !== 'string' || !DIALOG_FIGURES.has(entry as DialogFigure)) {
      throw new MpzStationDialogError(
        'INVALID_FIGUREN',
        'figuren darf nur frieda und otto enthalten.',
      )
    }
    const figur = entry as DialogFigure
    if (figuren.includes(figur)) {
      throw new MpzStationDialogError(
        'INVALID_FIGUREN',
        `Doppelte figur "${figur}".`,
      )
    }
    figuren.push(figur)
  }
  return figuren
}

function assertFigurenCoverSegments(
  figuren: DialogFigure[],
  segmente: DialogSegment[],
): void {
  for (const seg of segmente) {
    if (seg.rolle === 'beide') {
      if (!figuren.includes('frieda') || !figuren.includes('otto')) {
        throw new MpzStationDialogError(
          'FIGURE_IN_USE',
          `Segment "${seg.id}" mit rolle beide erfordert frieda und otto in figuren.`,
        )
      }
      continue
    }
    if (!figuren.includes(seg.rolle)) {
      throw new MpzStationDialogError(
        'FIGURE_IN_USE',
        `Figur "${seg.rolle}" wird von Segment "${seg.id}" genutzt und kann nicht entfernt werden.`,
      )
    }
  }
}

function gruppenIds(dialog: NonNullable<Station['dialog']>): Set<string> {
  return new Set((dialog.gruppen ?? []).map((g) => g.id))
}

function assertGruppeExists(
  dialog: NonNullable<Station['dialog']>,
  gruppeId: string,
): void {
  if (!gruppenIds(dialog).has(gruppeId)) {
    throw new MpzStationDialogError(
      'INVALID_GRUPPE',
      `Gruppe "${gruppeId}" ist unbekannt.`,
    )
  }
}

function validateBubbleField(
  field: keyof DialogBubbleLayout,
  value: unknown,
): void {
  if (field === 'followPan') {
    if (typeof value !== 'boolean') {
      throw new MpzStationDialogError('INVALID_BUBBLE', 'followPan muss boolean sein.')
    }
    return
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new MpzStationDialogError('INVALID_BUBBLE', `${field} muss eine Zahl sein.`)
  }
  const ranges: Record<string, [number, number]> = {
    y: [MIN_BUBBLE_Y, MAX_BUBBLE_Y],
    x: [MIN_BUBBLE_X, MAX_BUBBLE_X],
    maxWidth: [MIN_BUBBLE_MAX_WIDTH, MAX_BUBBLE_MAX_WIDTH],
    fontSize: [MIN_BUBBLE_FONT_SIZE, MAX_BUBBLE_FONT_SIZE],
  }
  const range = ranges[field]
  if (!range) {
    return
  }
  if (value < range[0] || value > range[1]) {
    throw new MpzStationDialogError(
      'INVALID_BUBBLE',
      `bubble.${field} muss ${range[0]}–${range[1]} sein.`,
    )
  }
}

function mergeBubble(
  current: DialogBubbleLayout | undefined,
  patch: DialogBubbleLayout,
): DialogBubbleLayout {
  const next: DialogBubbleLayout = { ...current }
  if (patch.y !== undefined) {
    validateBubbleField('y', patch.y)
    next.y = patch.y
  }
  if (patch.x !== undefined) {
    validateBubbleField('x', patch.x)
    next.x = patch.x
  }
  if (patch.maxWidth !== undefined) {
    validateBubbleField('maxWidth', patch.maxWidth)
    next.maxWidth = patch.maxWidth
  }
  if (patch.fontSize !== undefined) {
    validateBubbleField('fontSize', patch.fontSize)
    next.fontSize = patch.fontSize
  }
  if (patch.followPan !== undefined) {
    validateBubbleField('followPan', patch.followPan)
    next.followPan = patch.followPan
  }
  return next
}

function dialogIdPrefix(slug: string): string {
  if (slug === 'daz') return 'd'
  if (slug === 'pc-raum') return 'p'
  return slug.slice(0, 1)
}

function generateSegmentId(slug: string, segmente: DialogSegment[]): string {
  const prefix = dialogIdPrefix(slug)
  const ids = new Set(segmente.map((s) => s.id))
  let n = 1
  while (ids.has(`${prefix}${n}`)) {
    n += 1
  }
  return `${prefix}${n}`
}

function findSegment(
  dialog: NonNullable<Station['dialog']>,
  segmentId: string,
): DialogSegment {
  const seg = dialog.segmente.find((s) => s.id === segmentId)
  if (!seg) {
    throw new MpzStationDialogError(
      'NOT_FOUND',
      `Segment "${segmentId}" nicht gefunden.`,
    )
  }
  return seg
}

function findGruppe(
  dialog: NonNullable<Station['dialog']>,
  gruppeId: string,
): DialogGruppe {
  const gruppe = dialog.gruppen?.find((g) => g.id === gruppeId)
  if (!gruppe) {
    throw new MpzStationDialogError(
      'NOT_FOUND',
      `Gruppe "${gruppeId}" nicht gefunden.`,
    )
  }
  return gruppe
}

async function persistDialogMutation(
  slug: string,
  mutate: (station: Station, segmentsBefore: DialogSegment[]) => void,
  needsAudioSync: boolean,
  io: MpzContentIo = createMpzContentIo(),
): Promise<DialogWriteResult> {
  return withMpzWriteLock(async () => {
    const data = await io.readStations()
    const station = findHubStation(data, slug)
    const dialog = requireDialogBlock(station)
    const segmentsBefore = structuredClone(dialog.segmente)

    mutate(station, segmentsBefore)

    const updatedDialog = station.dialog!
    if (needsAudioSync) {
      const { appRoot } = io.getPaths()
      try {
        await syncDialogAudioFiles(
          slug,
          segmentsBefore,
          updatedDialog.segmente,
          appRoot,
        )
      } catch (err) {
        if (err instanceof MpzDialogAudioSyncError) {
          throw new MpzStationDialogError('AUDIO_SYNC_FAILED', err.message)
        }
        throw err
      }
      updatedDialog.segmente = applyQuellenAfterSync(slug, updatedDialog.segmente)
    }

    const writeResult = await io.writeStations(data, {
      strict: true,
      postValidate: true,
      makeBackup: true,
      touchedSlugs: [slug],
    })

    const written = data.stations.find((s) => s.slug === slug)!
    return { station: written, mtime: writeResult.mtime }
  })
}

export async function patchDialogMeta(
  slug: string,
  patch: DialogMetaPatch,
  io?: MpzContentIo,
): Promise<DialogWriteResult> {
  const keys = Object.keys(patch) as (keyof DialogMetaPatch)[]
  if (keys.length === 0) {
    throw new MpzStationDialogError('NO_FIELDS', 'Keine Felder zum Aktualisieren.')
  }

  return persistDialogMutation(
    slug,
    (station, _segmentsBefore) => {
      const dialog = requireDialogBlock(station)

      if (patch.figuren !== undefined) {
        const figuren = normalizeFiguren(patch.figuren)
        assertFigurenCoverSegments(figuren, dialog.segmente)
        dialog.figuren = figuren
      }

      if (patch.bubble !== undefined) {
        if (patch.bubble === null) {
          delete dialog.bubble
        } else {
          dialog.bubble = mergeBubble(dialog.bubble, patch.bubble)
        }
      }
    },
    false,
    io,
  )
}

export async function addDialogSegment(
  slug: string,
  input: AddDialogSegmentInput,
  io?: MpzContentIo,
): Promise<DialogWriteResult> {
  const rolle = validateRolle(input.rolle)

  return persistDialogMutation(
    slug,
    (station, _segmentsBefore) => {
      const dialog = requireDialogBlock(station)
      if (dialog.segmente.length >= 99) {
        throw new MpzStationDialogError(
          'SEGMENT_LIMIT',
          'Maximal 99 Dialog-Segmente erlaubt.',
        )
      }

      const id = input.id?.trim() || generateSegmentId(slug, dialog.segmente)
      validateSegmentId(id)
      if (dialog.segmente.some((s) => s.id === id)) {
        throw new MpzStationDialogError(
          'DUPLICATE_ID',
          `Segment-ID "${id}" existiert bereits.`,
        )
      }

      if (input.gruppe !== undefined) {
        assertGruppeExists(dialog, input.gruppe)
      }
      if (input.tail !== undefined) {
        validateTail(input.tail)
      }

      const index = dialog.segmente.length
      const segment: DialogSegment = {
        id,
        rolle,
        text: input.text ?? '',
      }
      if (input.hasAudio === true) {
        segment.quelle = dialogApiQuelle(slug, buildClipName(index, rolle))
      }
      if (input.gruppe !== undefined) {
        segment.gruppe = input.gruppe
      }
      if (input.tail !== undefined) {
        segment.tail = input.tail
      }

      dialog.segmente.push(segment)
    },
    false,
    io,
  )
}

export async function patchDialogSegment(
  slug: string,
  segmentId: string,
  patch: PatchDialogSegmentInput,
  io?: MpzContentIo,
): Promise<DialogWriteResult> {
  const keys = Object.keys(patch) as (keyof PatchDialogSegmentInput)[]
  if (keys.length === 0) {
    throw new MpzStationDialogError('NO_FIELDS', 'Keine Felder zum Aktualisieren.')
  }

  const needsAudioSync = patch.rolle !== undefined

  return persistDialogMutation(
    slug,
    (station, _segmentsBefore) => {
      const dialog = requireDialogBlock(station)
      const segment = findSegment(dialog, segmentId)

      if (patch.text !== undefined) {
        segment.text = patch.text
      }
      if (patch.gruppe !== undefined) {
        if (patch.gruppe === null || patch.gruppe === '') {
          delete segment.gruppe
        } else {
          assertGruppeExists(dialog, patch.gruppe)
          segment.gruppe = patch.gruppe
        }
      }
      if (patch.tail !== undefined) {
        if (patch.tail === null) {
          delete segment.tail
        } else {
          segment.tail = validateTail(patch.tail)
        }
      }
      if (patch.rolle !== undefined) {
        segment.rolle = validateRolle(patch.rolle)
      }
      if (patch.hasAudio !== undefined) {
        if (patch.hasAudio) {
          const index = dialog.segmente.findIndex((s) => s.id === segmentId)
          segment.quelle = dialogApiQuelle(
            slug,
            buildClipName(index, segment.rolle),
          )
        } else {
          delete segment.quelle
        }
      }
    },
    needsAudioSync,
    io,
  )
}

export async function removeDialogSegment(
  slug: string,
  segmentId: string,
  io?: MpzContentIo,
): Promise<DialogWriteResult> {
  return persistDialogMutation(
    slug,
    (station, _segmentsBefore) => {
      const dialog = requireDialogBlock(station)
      if (dialog.segmente.length <= 1) {
        throw new MpzStationDialogError(
          'LAST_SEGMENT',
          'Das letzte Dialog-Segment kann nicht gelöscht werden.',
        )
      }
      const index = dialog.segmente.findIndex((s) => s.id === segmentId)
      if (index < 0) {
        throw new MpzStationDialogError(
          'NOT_FOUND',
          `Segment "${segmentId}" nicht gefunden.`,
        )
      }
      dialog.segmente.splice(index, 1)
    },
    true,
    io,
  )
}

export async function addDialogGruppe(
  slug: string,
  input: AddDialogGruppeInput,
  io?: MpzContentIo,
): Promise<DialogWriteResult> {
  validateGruppeId(input.id)
  if (typeof input.text !== 'string') {
    throw new MpzStationDialogError('NO_FIELDS', 'text ist erforderlich.')
  }

  return persistDialogMutation(
    slug,
    (station, _segmentsBefore) => {
      const dialog = requireDialogBlock(station)
      const gruppen = dialog.gruppen ?? []
      if (gruppen.some((g) => g.id === input.id)) {
        throw new MpzStationDialogError(
          'DUPLICATE_ID',
          `Gruppen-ID "${input.id}" existiert bereits.`,
        )
      }
      dialog.gruppen = [...gruppen, { id: input.id, text: input.text }]
    },
    false,
    io,
  )
}

export async function patchDialogGruppe(
  slug: string,
  gruppeId: string,
  patch: PatchDialogGruppeInput,
  io?: MpzContentIo,
): Promise<DialogWriteResult> {
  if (patch.text === undefined) {
    throw new MpzStationDialogError('NO_FIELDS', 'Keine Felder zum Aktualisieren.')
  }

  return persistDialogMutation(
    slug,
    (station, _segmentsBefore) => {
      const dialog = requireDialogBlock(station)
      const gruppe = findGruppe(dialog, gruppeId)
      gruppe.text = patch.text!
    },
    false,
    io,
  )
}

export async function removeDialogGruppe(
  slug: string,
  gruppeId: string,
  io?: MpzContentIo,
): Promise<DialogWriteResult> {
  return persistDialogMutation(
    slug,
    (station, _segmentsBefore) => {
      const dialog = requireDialogBlock(station)
      const used = dialog.segmente.some((s) => s.gruppe === gruppeId)
      if (used) {
        throw new MpzStationDialogError(
          'GROUP_IN_USE',
          `Gruppe "${gruppeId}" wird von Segmenten referenziert.`,
        )
      }
      if (!dialog.gruppen?.length) {
        throw new MpzStationDialogError('NOT_FOUND', `Gruppe "${gruppeId}" nicht gefunden.`)
      }
      const next = dialog.gruppen.filter((g) => g.id !== gruppeId)
      if (next.length === dialog.gruppen.length) {
        throw new MpzStationDialogError('NOT_FOUND', `Gruppe "${gruppeId}" nicht gefunden.`)
      }
      dialog.gruppen = next.length > 0 ? next : undefined
    },
    false,
    io,
  )
}

export async function createDialog(
  slug: string,
  io: MpzContentIo = createMpzContentIo(),
): Promise<DialogWriteResult> {
  return withMpzWriteLock(async () => {
    const data = await io.readStations()
    const station = findHubStation(data, slug)
    if (station.dialog !== undefined) {
      throw new MpzStationDialogError(
        'DIALOG_EXISTS',
        `Station "${slug}" hat bereits einen Dialog.`,
      )
    }
    station.dialog = {
      figuren: ['frieda', 'otto'],
      segmente: [],
      gruppen: [],
    }
    const writeResult = await io.writeStations(data, {
      strict: true,
      postValidate: true,
      makeBackup: true,
      touchedSlugs: [slug],
    })
    const written = data.stations.find((s) => s.slug === slug)!
    return { station: written, mtime: writeResult.mtime }
  })
}

export async function removeDialog(
  slug: string,
  io: MpzContentIo = createMpzContentIo(),
): Promise<DialogWriteResult> {
  return withMpzWriteLock(async () => {
    const data = await io.readStations()
    const station = findHubStation(data, slug)
    if (station.dialog === undefined) {
      throw new MpzStationDialogError(
        'NO_DIALOG',
        `Station "${slug}" hat keinen Dialog.`,
      )
    }
    if (hasStationDialogHotspot(station)) {
      throw new MpzStationDialogError(
        'DIALOG_IN_USE',
        `Station "${slug}" hat Dialog-Hotspots — zuerst im Hotspots-Tab entfernen.`,
      )
    }
    delete station.dialog
    const writeResult = await io.writeStations(data, {
      strict: true,
      postValidate: true,
      makeBackup: true,
      touchedSlugs: [slug],
    })
    const written = data.stations.find((s) => s.slug === slug)!
    return { station: written, mtime: writeResult.mtime }
  })
}
