import {
  createMpzContentIo,
  type CoachWriteResult,
  type MpzContentIo,
  withMpzWriteLock,
} from '@/lib/mpz-content-io'
import {
  COACH_MASCOTS,
  COACH_MODES,
  COACH_PLACEMENTS,
  COACH_TRIGGERS,
} from '@/lib/mpz-coach-messages-validation'
import {
  normalizeCoachLayoutInput,
  validateCoachLayoutFields,
} from '@/lib/coach-layout'
import { coachApiQuelle } from '@/lib/coach-audio'
import type {
  CoachMascot,
  CoachMessage,
  CoachMessageLayout,
  CoachMessagesFile,
  CoachMode,
  CoachPlacement,
  CoachTrigger,
} from '@/lib/types'

export type CoachErrorCode =
  | 'NOT_FOUND'
  | 'NO_FIELDS'
  | 'DUPLICATE_ID'
  | 'INVALID_ID'
  | 'INVALID_TRIGGER'
  | 'INVALID_MASCOT'
  | 'INVALID_PLACEMENT'
  | 'INVALID_DUO_PLACEMENT'
  | 'INVALID_TEXT'
  | 'INVALID_MODES'
  | 'INVALID_MILESTONE'
  | 'FORBIDDEN_FIELD'
  | 'INVALID_SLUG'
  | 'DUPLICATE_HUB_COMPLETE'
  | 'LAST_HUB_COMPLETE'
  | 'IMMUTABLE_FIELD'
  | 'INVALID_LAYOUT'
  | 'INVALID_QUELLE'

export type AddCoachMessageInput = {
  id: string
  trigger: CoachTrigger
  mascot: CoachMascot
  placement: CoachPlacement
  text: string
  milestone?: number
  slug?: string
  modes?: readonly CoachMode[]
  layout?: CoachMessageLayout
  quelle?: string
}

export type PatchCoachMessageInput = {
  mascot?: CoachMascot
  placement?: CoachPlacement
  text?: string
  milestone?: number
  slug?: string
  modes?: readonly CoachMode[] | null
  layout?: CoachMessageLayout | null
  quelle?: string | null
}

export class MpzCoachMessagesError extends Error {
  readonly code: CoachErrorCode

  constructor(code: CoachErrorCode, message: string) {
    super(message)
    this.name = 'MpzCoachMessagesError'
    this.code = code
  }
}

export const COACH_CLIENT_ERROR_CODES = new Set<CoachErrorCode>([
  'NO_FIELDS',
  'DUPLICATE_ID',
  'INVALID_ID',
  'INVALID_TRIGGER',
  'INVALID_MASCOT',
  'INVALID_PLACEMENT',
  'INVALID_DUO_PLACEMENT',
  'INVALID_TEXT',
  'INVALID_MODES',
  'INVALID_MILESTONE',
  'FORBIDDEN_FIELD',
  'INVALID_SLUG',
  'DUPLICATE_HUB_COMPLETE',
  'LAST_HUB_COMPLETE',
  'IMMUTABLE_FIELD',
  'INVALID_LAYOUT',
  'INVALID_QUELLE',
])

export function mapCoachError(
  err: MpzCoachMessagesError,
): { status: number; body: { error: string; message: string } } {
  if (err.code === 'NOT_FOUND') {
    return { status: 404, body: { error: err.code, message: err.message } }
  }
  const status = COACH_CLIENT_ERROR_CODES.has(err.code) ? 422 : 500
  return { status, body: { error: err.code, message: err.message } }
}

const MESSAGE_ID_RE = /^[a-z0-9][a-z0-9-]*$/

function stationContext(io: MpzContentIo): Promise<{
  stationCount: number
  stationSlugs: Set<string>
}> {
  return io.readStations().then((data) => ({
    stationCount: data.stations.length,
    stationSlugs: new Set(
      data.stations.map((s) => s.slug).filter((slug): slug is string => !!slug),
    ),
  }))
}

function validateId(id: string): void {
  if (!id || !MESSAGE_ID_RE.test(id)) {
    throw new MpzCoachMessagesError(
      'INVALID_ID',
      `Message-ID "${id}" ist ungültig (erwartet: Kleinbuchstaben, Ziffern, Bindestriche).`,
    )
  }
}

function validateTrigger(trigger: unknown): CoachTrigger {
  if (typeof trigger !== 'string' || !COACH_TRIGGERS.has(trigger)) {
    throw new MpzCoachMessagesError(
      'INVALID_TRIGGER',
      'trigger muss hub-milestone, hub-complete oder room-first sein.',
    )
  }
  return trigger as CoachTrigger
}

function validateMascot(mascot: unknown): CoachMascot {
  if (typeof mascot !== 'string' || !COACH_MASCOTS.has(mascot)) {
    throw new MpzCoachMessagesError(
      'INVALID_MASCOT',
      'mascot muss frieda, otto oder duo sein.',
    )
  }
  return mascot as CoachMascot
}

function validatePlacement(placement: unknown): CoachPlacement {
  if (typeof placement !== 'string' || !COACH_PLACEMENTS.has(placement)) {
    throw new MpzCoachMessagesError(
      'INVALID_PLACEMENT',
      'placement muss bottom, left, right oder duo-split sein.',
    )
  }
  return placement as CoachPlacement
}

function validateDuoPlacement(mascot: CoachMascot, placement: CoachPlacement): void {
  if (mascot === 'duo' && placement !== 'duo-split') {
    throw new MpzCoachMessagesError(
      'INVALID_DUO_PLACEMENT',
      'mascot "duo" erfordert placement "duo-split".',
    )
  }
  if (placement === 'duo-split' && mascot !== 'duo') {
    throw new MpzCoachMessagesError(
      'INVALID_DUO_PLACEMENT',
      'placement "duo-split" erfordert mascot "duo".',
    )
  }
}

function validateText(text: unknown): string {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new MpzCoachMessagesError('INVALID_TEXT', 'text darf nicht leer sein.')
  }
  return text
}

function validateModes(modes: unknown): readonly CoachMode[] | undefined {
  if (modes === undefined) {
    return undefined
  }
  if (!Array.isArray(modes) || modes.length === 0) {
    throw new MpzCoachMessagesError(
      'INVALID_MODES',
      'modes muss ein nicht-leeres Array sein.',
    )
  }
  const result: CoachMode[] = []
  for (const mode of modes) {
    if (typeof mode !== 'string' || !COACH_MODES.has(mode)) {
      throw new MpzCoachMessagesError(
        'INVALID_MODES',
        'modes darf nur fest und heft enthalten.',
      )
    }
    if (!result.includes(mode as CoachMode)) {
      result.push(mode as CoachMode)
    }
  }
  return result
}

function validateMilestone(
  milestone: unknown,
  stationCount: number,
): number {
  if (typeof milestone !== 'number' || !Number.isInteger(milestone)) {
    throw new MpzCoachMessagesError(
      'INVALID_MILESTONE',
      'hub-milestone braucht ein ganzzahliges milestone.',
    )
  }
  if (milestone < 0 || milestone >= stationCount) {
    throw new MpzCoachMessagesError(
      'INVALID_MILESTONE',
      `milestone ${milestone} außerhalb 0–${stationCount - 1}.`,
    )
  }
  return milestone
}

function validateSlug(
  slug: unknown,
  stationSlugs: ReadonlySet<string>,
): string {
  if (typeof slug !== 'string' || !stationSlugs.has(slug)) {
    throw new MpzCoachMessagesError(
      'INVALID_SLUG',
      `room-first slug "${slug}" unbekannt in stations.json.`,
    )
  }
  return slug
}

function validateLayoutField(layout: unknown): CoachMessageLayout | undefined {
  if (layout === undefined) {
    return undefined
  }
  if (typeof layout !== 'object' || layout === null || Array.isArray(layout)) {
    throw new MpzCoachMessagesError(
      'INVALID_LAYOUT',
      'layout muss ein Objekt sein.',
    )
  }

  const errors = validateCoachLayoutFields(layout, 'layout')
  if (errors.length > 0) {
    throw new MpzCoachMessagesError('INVALID_LAYOUT', errors[0]!)
  }

  return normalizeCoachLayoutInput(layout as CoachMessageLayout)
}

function validateQuelleField(
  quelle: unknown,
  messageId: string,
): string | undefined {
  if (quelle === undefined) {
    return undefined
  }
  if (typeof quelle !== 'string' || !quelle.startsWith('/')) {
    throw new MpzCoachMessagesError(
      'INVALID_QUELLE',
      'quelle muss ein String sein, der mit / beginnt.',
    )
  }
  if (quelle !== coachApiQuelle(messageId)) {
    throw new MpzCoachMessagesError(
      'INVALID_QUELLE',
      `quelle muss "${coachApiQuelle(messageId)}" sein.`,
    )
  }
  return quelle
}

function assertHubCompleteUnique(
  messages: CoachMessage[],
  excludeId?: string,
): void {
  const count = messages.filter(
    (m) => m.trigger === 'hub-complete' && m.id !== excludeId,
  ).length
  if (count >= 1) {
    throw new MpzCoachMessagesError(
      'DUPLICATE_HUB_COMPLETE',
      'Es darf nur eine hub-complete-Message geben.',
    )
  }
}

function normalizeMessageFields(
  message: CoachMessage,
  stationCount: number,
  stationSlugs: ReadonlySet<string>,
): CoachMessage {
  const trigger = validateTrigger(message.trigger)
  const mascot = validateMascot(message.mascot)
  const placement = validatePlacement(message.placement)
  validateDuoPlacement(mascot, placement)
  const text = validateText(message.text)
  const modes = validateModes(message.modes)

  const normalized: CoachMessage = {
    id: message.id,
    trigger,
    mascot,
    placement,
    text,
  }

  if (modes !== undefined) {
    normalized.modes = modes
  }

  const layout = validateLayoutField(message.layout)
  if (layout !== undefined) {
    normalized.layout = layout
  }

  const quelle = validateQuelleField(message.quelle, message.id)
  if (quelle !== undefined) {
    normalized.quelle = quelle
  }

  if (trigger === 'hub-milestone') {
    if (message.slug !== undefined) {
      throw new MpzCoachMessagesError(
        'FORBIDDEN_FIELD',
        'hub-milestone darf kein slug haben.',
      )
    }
    normalized.milestone = validateMilestone(message.milestone, stationCount)
    return normalized
  }

  if (trigger === 'hub-complete') {
    if (message.milestone !== undefined) {
      throw new MpzCoachMessagesError(
        'FORBIDDEN_FIELD',
        'hub-complete darf kein milestone haben.',
      )
    }
    if (message.slug !== undefined) {
      throw new MpzCoachMessagesError(
        'FORBIDDEN_FIELD',
        'hub-complete darf kein slug haben.',
      )
    }
    return normalized
  }

  if (message.milestone !== undefined) {
    throw new MpzCoachMessagesError(
      'FORBIDDEN_FIELD',
      'room-first darf kein milestone haben.',
    )
  }
  normalized.slug = validateSlug(message.slug, stationSlugs)
  return normalized
}

function findMessage(data: CoachMessagesFile, id: string): CoachMessage {
  const message = data.messages.find((m) => m.id === id)
  if (!message) {
    throw new MpzCoachMessagesError(
      'NOT_FOUND',
      `Coach-Message "${id}" nicht gefunden.`,
    )
  }
  return message
}

async function persistCoachMutation(
  mutate: (
    data: CoachMessagesFile,
    ctx: { stationCount: number; stationSlugs: Set<string> },
  ) => void,
  io: MpzContentIo = createMpzContentIo(),
): Promise<CoachWriteResult> {
  return withMpzWriteLock(async () => {
    const ctx = await stationContext(io)
    const data = await io.readCoachMessages()

    mutate(data, ctx)

    const writeResult = await io.writeCoachMessages(data, {
      makeBackup: true,
      postValidate: true,
      stationCount: ctx.stationCount,
      stationSlugs: ctx.stationSlugs,
    })

    return { messages: data.messages, mtime: writeResult.mtime }
  })
}

export async function addCoachMessage(
  input: AddCoachMessageInput,
  io?: MpzContentIo,
): Promise<CoachWriteResult> {
  const id = input.id.trim()
  validateId(id)
  validateTrigger(input.trigger)

  return persistCoachMutation((data, ctx) => {
    if (data.messages.some((m) => m.id === id)) {
      throw new MpzCoachMessagesError(
        'DUPLICATE_ID',
        `Message-ID "${id}" existiert bereits.`,
      )
    }

    const draft: CoachMessage = {
      id,
      trigger: input.trigger,
      mascot: input.mascot,
      placement: input.placement,
      text: input.text,
      milestone: input.milestone,
      slug: input.slug,
      modes: input.modes,
      layout: input.layout,
      quelle: input.quelle,
    }

    const normalized = normalizeMessageFields(
      draft,
      ctx.stationCount,
      ctx.stationSlugs,
    )

    if (normalized.trigger === 'hub-complete') {
      assertHubCompleteUnique(data.messages)
    }

    data.messages.push(normalized)
  }, io)
}

export async function patchCoachMessage(
  messageId: string,
  patch: PatchCoachMessageInput,
  io?: MpzContentIo,
): Promise<CoachWriteResult> {
  const keys = Object.keys(patch) as (keyof PatchCoachMessageInput)[]
  if (keys.length === 0) {
    throw new MpzCoachMessagesError('NO_FIELDS', 'Keine Felder zum Aktualisieren.')
  }

  return persistCoachMutation((data, ctx) => {
    const message = findMessage(data, messageId)
    const merged: CoachMessage = { ...message }

    if (patch.mascot !== undefined) {
      merged.mascot = patch.mascot
    }
    if (patch.placement !== undefined) {
      merged.placement = patch.placement
    }
    if (patch.text !== undefined) {
      merged.text = patch.text
    }
    if (patch.milestone !== undefined) {
      merged.milestone = patch.milestone
    }
    if (patch.slug !== undefined) {
      merged.slug = patch.slug
    }
    if (patch.modes === null) {
      delete merged.modes
    } else if (patch.modes !== undefined) {
      merged.modes = patch.modes
    }
    if (patch.layout === null) {
      delete merged.layout
    } else if (patch.layout !== undefined) {
      merged.layout = patch.layout
    }
    if (patch.quelle === null) {
      delete merged.quelle
    } else if (patch.quelle !== undefined) {
      merged.quelle = patch.quelle
    }

    const normalized = normalizeMessageFields(
      merged,
      ctx.stationCount,
      ctx.stationSlugs,
    )

    if (
      normalized.trigger === 'hub-complete' &&
      message.trigger !== 'hub-complete'
    ) {
      assertHubCompleteUnique(data.messages, messageId)
    }

    const index = data.messages.findIndex((m) => m.id === messageId)
    data.messages[index] = normalized
  }, io)
}

export async function removeCoachMessage(
  messageId: string,
  io?: MpzContentIo,
): Promise<CoachWriteResult> {
  return persistCoachMutation((data, _ctx) => {
    const index = data.messages.findIndex((m) => m.id === messageId)
    if (index < 0) {
      throw new MpzCoachMessagesError(
        'NOT_FOUND',
        `Coach-Message "${messageId}" nicht gefunden.`,
      )
    }

    const target = data.messages[index]!
    if (target.trigger === 'hub-complete') {
      const hubCompleteCount = data.messages.filter(
        (m) => m.trigger === 'hub-complete',
      ).length
      if (hubCompleteCount <= 1) {
        throw new MpzCoachMessagesError(
          'LAST_HUB_COMPLETE',
          'Die einzige hub-complete-Message kann nicht gelöscht werden.',
        )
      }
    }

    data.messages.splice(index, 1)
  }, io)
}

export function assertImmutableCoachPatch(
  body: Record<string, unknown>,
): void {
  if ('id' in body && body.id !== undefined) {
    throw new MpzCoachMessagesError(
      'IMMUTABLE_FIELD',
      'id kann nach dem Anlegen nicht geändert werden.',
    )
  }
  if ('trigger' in body && body.trigger !== undefined) {
    throw new MpzCoachMessagesError(
      'IMMUTABLE_FIELD',
      'trigger kann nach dem Anlegen nicht geändert werden.',
    )
  }
}
