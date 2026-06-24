import type { CSSProperties } from 'react'
import type { CoachMessage, CoachMessageLayout, CoachPlacement } from '@/lib/types'

export const COACH_LAYOUT_FIELD_KEYS = [
  'mascotSize',
  'mascotOffsetX',
  'mascotOffsetY',
  'bubbleMaxWidth',
  'bubbleOffsetX',
  'bubbleOffsetY',
  'bubbleFontSize',
] as const satisfies readonly (keyof CoachMessageLayout)[]

export const COACH_LAYOUT_BOOLEAN_KEYS = [
  'mascotFlipX',
  'mascotFlipY',
] as const satisfies readonly (keyof CoachMessageLayout)[]

export const COACH_LAYOUT_ALL_KEYS = [
  ...COACH_LAYOUT_FIELD_KEYS,
  ...COACH_LAYOUT_BOOLEAN_KEYS,
] as const

export type CoachLayoutFieldKey = (typeof COACH_LAYOUT_FIELD_KEYS)[number]
export type CoachLayoutBooleanKey = (typeof COACH_LAYOUT_BOOLEAN_KEYS)[number]

export const COACH_LAYOUT_CLAMPS: Record<
  CoachLayoutFieldKey,
  { min: number; max: number }
> = {
  mascotSize: { min: 0.15, max: 0.55 },
  mascotOffsetX: { min: -5, max: 5 },
  mascotOffsetY: { min: -5, max: 5 },
  bubbleMaxWidth: { min: 12, max: 32 },
  bubbleOffsetX: { min: -5, max: 5 },
  bubbleOffsetY: { min: -5, max: 5 },
  bubbleFontSize: { min: 12, max: 20 },
}

export const DEFAULT_MASCOT_SIZE = 0.42
/** Anteil der Viewport-Breite — verhindert Überlauf bei `placement: left|right`. */
export const COACH_MASCOT_MAX_WIDTH_VW_PERCENT = 45
export const DEFAULT_BUBBLE_MAX_WIDTH_REM = 22
export const DEFAULT_BUBBLE_FONT_SIZE = 15
export const DEFAULT_BUBBLE_MARGIN_Y_REM = 0.75
export const DEFAULT_DUO_BUBBLE_MARGIN_Y_REM = -0.5

export type ResolvedCoachLayout = {
  figureStyle?: CSSProperties
  imgStyle: CSSProperties
  duoRowStyle?: CSSProperties
  bubbleStyle: CSSProperties
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function clampField(key: CoachLayoutFieldKey, value: number): number {
  const { min, max } = COACH_LAYOUT_CLAMPS[key]
  return clamp(value, min, max)
}

function mascotSizeToVh(mascotSize: number): string {
  return `${Math.round(mascotSize * 1000) / 10}vh`
}

function resolveNumericField(
  layout: CoachMessageLayout | undefined,
  key: CoachLayoutFieldKey,
  defaultValue: number,
): number {
  const raw = layout?.[key]
  if (raw === undefined) {
    return defaultValue
  }
  return clampField(key, raw)
}

function resolveFlip(
  layout: CoachMessageLayout | undefined,
  key: CoachLayoutBooleanKey,
): boolean {
  return layout?.[key] === true
}

function buildFigureTransform(
  offsetX: number,
  offsetY: number,
  flipX: boolean,
  flipY: boolean,
  includeOffset: boolean,
): string | undefined {
  const parts: string[] = []
  if (includeOffset && (offsetX !== 0 || offsetY !== 0)) {
    parts.push(`translate(${offsetX}rem, ${offsetY}rem)`)
  }
  const scaleX = flipX ? -1 : 1
  const scaleY = flipY ? -1 : 1
  if (scaleX !== 1 || scaleY !== 1) {
    parts.push(`scale(${scaleX}, ${scaleY})`)
  }
  return parts.length > 0 ? parts.join(' ') : undefined
}

export function validateCoachLayoutFields(
  layout: unknown,
  ctx: string,
): string[] {
  const errors: string[] = []
  if (layout === undefined) {
    return errors
  }
  if (typeof layout !== 'object' || layout === null || Array.isArray(layout)) {
    errors.push(`${ctx}: layout muss ein Objekt sein`)
    return errors
  }

  const record = layout as Record<string, unknown>
  for (const key of Object.keys(record)) {
    if (!COACH_LAYOUT_ALL_KEYS.includes(key as (typeof COACH_LAYOUT_ALL_KEYS)[number])) {
      errors.push(`${ctx}: unbekanntes layout-Feld "${key}"`)
    }
  }

  for (const key of COACH_LAYOUT_FIELD_KEYS) {
    if (!(key in record)) {
      continue
    }
    const value = record[key]
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      errors.push(`${ctx}: layout.${key} muss eine endliche Zahl sein`)
      continue
    }
    const { min, max } = COACH_LAYOUT_CLAMPS[key]
    if (value < min || value > max) {
      errors.push(`${ctx}: layout.${key} außerhalb ${min}–${max}`)
    }
  }

  for (const key of COACH_LAYOUT_BOOLEAN_KEYS) {
    if (!(key in record)) {
      continue
    }
    if (typeof record[key] !== 'boolean') {
      errors.push(`${ctx}: layout.${key} muss boolean sein`)
    }
  }

  return errors
}

export function resolveCoachLayout(
  message: Pick<CoachMessage, 'placement' | 'layout'>,
): ResolvedCoachLayout {
  const layout = message.layout
  const isDuo = message.placement === 'duo-split'

  const mascotSize = resolveNumericField(layout, 'mascotSize', DEFAULT_MASCOT_SIZE)
  const mascotOffsetX = resolveNumericField(layout, 'mascotOffsetX', 0)
  const mascotOffsetY = resolveNumericField(layout, 'mascotOffsetY', 0)
  const bubbleMaxWidth = resolveNumericField(
    layout,
    'bubbleMaxWidth',
    DEFAULT_BUBBLE_MAX_WIDTH_REM,
  )
  const bubbleOffsetX = resolveNumericField(layout, 'bubbleOffsetX', 0)
  const bubbleOffsetY = resolveNumericField(layout, 'bubbleOffsetY', 0)
  const bubbleFontSize = resolveNumericField(
    layout,
    'bubbleFontSize',
    DEFAULT_BUBBLE_FONT_SIZE,
  )
  const mascotFlipX = resolveFlip(layout, 'mascotFlipX')
  const mascotFlipY = resolveFlip(layout, 'mascotFlipY')

  const baseBubbleMarginY = isDuo
    ? DEFAULT_DUO_BUBBLE_MARGIN_Y_REM
    : DEFAULT_BUBBLE_MARGIN_Y_REM
  const bubbleMarginTop = baseBubbleMarginY + bubbleOffsetY

  const mascotHeight = mascotSizeToVh(mascotSize)
  const imgStyle: CSSProperties = {
    height: mascotHeight,
    maxWidth: `min(${COACH_MASCOT_MAX_WIDTH_VW_PERCENT}%, ${mascotHeight})`,
  }

  const figureTransform = buildFigureTransform(
    mascotOffsetX,
    mascotOffsetY,
    mascotFlipX,
    mascotFlipY,
    !isDuo,
  )

  const duoRowTransform = isDuo
    ? buildFigureTransform(mascotOffsetX, mascotOffsetY, false, false, true)
    : undefined

  const duoFigureTransform = isDuo
    ? buildFigureTransform(0, 0, mascotFlipX, mascotFlipY, false)
    : undefined

  const figureStyle: CSSProperties | undefined = figureTransform
    ? { transform: figureTransform }
    : undefined

  const duoRowStyle: CSSProperties | undefined = duoRowTransform
    ? { transform: duoRowTransform }
    : undefined

  const duoFigureStyle: CSSProperties | undefined = duoFigureTransform
    ? { transform: duoFigureTransform }
    : undefined

  const bubbleStyle: CSSProperties = {
    marginTop: `${bubbleMarginTop}rem`,
    maxWidth: `min(100%, ${bubbleMaxWidth}rem)`,
    fontSize: `${bubbleFontSize}px`,
  }

  if (bubbleOffsetX !== 0) {
    bubbleStyle.marginLeft = `${bubbleOffsetX}rem`
  }

  return {
    figureStyle: isDuo ? duoFigureStyle : figureStyle,
    imgStyle,
    duoRowStyle,
    bubbleStyle,
  }
}

export function normalizeCoachLayoutInput(
  layout: CoachMessageLayout,
): CoachMessageLayout | undefined {
  const normalized: CoachMessageLayout = {}
  for (const key of COACH_LAYOUT_FIELD_KEYS) {
    const value = layout[key]
    if (value !== undefined) {
      normalized[key] = value
    }
  }
  for (const key of COACH_LAYOUT_BOOLEAN_KEYS) {
    if (layout[key] === true) {
      normalized[key] = true
    }
  }
  return Object.keys(normalized).length > 0 ? normalized : undefined
}

export function parseCoachLayoutBody(
  value: unknown,
  allowNull: boolean,
): CoachMessageLayout | null | undefined {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return allowNull ? null : undefined
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  const record = value as Record<string, unknown>
  const layout: CoachMessageLayout = {}
  for (const key of COACH_LAYOUT_FIELD_KEYS) {
    if (!(key in record)) {
      continue
    }
    const fieldValue = record[key]
    if (typeof fieldValue !== 'number' || !Number.isFinite(fieldValue)) {
      return undefined
    }
    layout[key] = fieldValue
  }
  for (const key of COACH_LAYOUT_BOOLEAN_KEYS) {
    if (!(key in record)) {
      continue
    }
    const fieldValue = record[key]
    if (typeof fieldValue !== 'boolean') {
      return undefined
    }
    if (fieldValue) {
      layout[key] = true
    }
  }
  return layout
}

export function placementLayoutHint(placement: CoachPlacement): string {
  switch (placement) {
    case 'duo-split':
      return 'Duo-Row: mascotOffset auf beide Figuren; Spiegelung gilt für beide; Blase zentriert (Default margin-top −0,5 rem).'
    case 'bottom':
      return 'Figur zentriert unten; Blase darunter (Default margin-top 0,75 rem).'
    case 'left':
      return 'Figur links unten; Blase darunter (Default margin-top 0,75 rem).'
    case 'right':
      return 'Figur rechts unten; Blase darunter (Default margin-top 0,75 rem).'
  }
}
