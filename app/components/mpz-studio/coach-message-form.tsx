'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import {
  COACH_LAYOUT_CLAMPS,
  COACH_LAYOUT_FIELD_KEYS,
  placementLayoutHint,
} from '@/lib/coach-layout'
import type {
  CoachMascot,
  CoachMessage,
  CoachMessageLayout,
  CoachMode,
  CoachPlacement,
  CoachTrigger,
} from '@/lib/types'

export type CoachMessageFormProps = {
  mode: 'add' | 'edit'
  message?: CoachMessage
  stationSlugs: readonly string[]
  stationCount: number
  onCancel: () => void
  onSuccess: (message: string) => void
}

const TRIGGERS: CoachTrigger[] = ['hub-milestone', 'hub-complete', 'room-first']
const MASCOTS: CoachMascot[] = ['frieda', 'otto', 'duo']
const PLACEMENTS: CoachPlacement[] = ['bottom', 'left', 'right', 'duo-split']
const MODES: CoachMode[] = ['fest', 'heft']

const LAYOUT_FIELD_META: {
  key: (typeof COACH_LAYOUT_FIELD_KEYS)[number]
  label: string
  step: string
}[] = [
  { key: 'mascotSize', label: 'Figur-Größe (vh-Anteil)', step: '0.01' },
  { key: 'mascotOffsetX', label: 'Figur-Versatz X (rem)', step: '0.25' },
  { key: 'mascotOffsetY', label: 'Figur-Versatz Y (rem)', step: '0.25' },
  { key: 'bubbleMaxWidth', label: 'Blasen-Breite (rem)', step: '1' },
  { key: 'bubbleOffsetX', label: 'Blasen-Versatz X (rem)', step: '0.25' },
  { key: 'bubbleOffsetY', label: 'Blasen-Versatz Y (rem, Delta)', step: '0.25' },
  { key: 'bubbleFontSize', label: 'Blasen-Schrift (px)', step: '1' },
]

type LayoutFormState = {
  fields: Record<(typeof COACH_LAYOUT_FIELD_KEYS)[number], string>
  mascotFlipX: boolean
  mascotFlipY: boolean
}

function emptyLayoutForm(): LayoutFormState {
  return {
    fields: {
      mascotSize: '',
      mascotOffsetX: '',
      mascotOffsetY: '',
      bubbleMaxWidth: '',
      bubbleOffsetX: '',
      bubbleOffsetY: '',
      bubbleFontSize: '',
    },
    mascotFlipX: false,
    mascotFlipY: false,
  }
}

function layoutFormFromMessage(message?: CoachMessage): LayoutFormState {
  const layout = message?.layout
  const state = emptyLayoutForm()
  if (!layout) {
    return state
  }
  for (const key of COACH_LAYOUT_FIELD_KEYS) {
    const value = layout[key]
    if (value !== undefined) {
      state.fields[key] = String(value)
    }
  }
  state.mascotFlipX = layout.mascotFlipX === true
  state.mascotFlipY = layout.mascotFlipY === true
  return state
}

function buildLayoutPayload(state: LayoutFormState): CoachMessageLayout | undefined {
  const layout: CoachMessageLayout = {}
  for (const key of COACH_LAYOUT_FIELD_KEYS) {
    const raw = state.fields[key].trim()
    if (raw === '') {
      continue
    }
    const num = Number.parseFloat(raw)
    if (!Number.isFinite(num)) {
      continue
    }
    layout[key] = num
  }
  if (state.mascotFlipX) {
    layout.mascotFlipX = true
  }
  if (state.mascotFlipY) {
    layout.mascotFlipY = true
  }
  return Object.keys(layout).length > 0 ? layout : undefined
}

function fieldClassName(): string {
  return 'w-full rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-fg-1'
}

function labelClassName(): string {
  return 'mb-1 block text-xs font-semibold text-fg-3'
}

export function CoachMessageForm({
  mode,
  message,
  stationSlugs,
  stationCount,
  onCancel,
  onSuccess,
}: CoachMessageFormProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const [id, setId] = useState(message?.id ?? '')
  const [trigger, setTrigger] = useState<CoachTrigger>(
    message?.trigger ?? 'hub-milestone',
  )
  const [mascot, setMascot] = useState<CoachMascot>(message?.mascot ?? 'frieda')
  const [placement, setPlacement] = useState<CoachPlacement>(
    message?.placement ?? 'left',
  )
  const [text, setText] = useState(message?.text ?? '')
  const [milestone, setMilestone] = useState(
    message?.milestone !== undefined ? String(message.milestone) : '0',
  )
  const [slug, setSlug] = useState(message?.slug ?? stationSlugs[0] ?? '')
  const [festMode, setFestMode] = useState(
    !message?.modes || message.modes.includes('fest'),
  )
  const [heftMode, setHeftMode] = useState(
    !message?.modes || message.modes.includes('heft'),
  )
  const [layoutOpen, setLayoutOpen] = useState(Boolean(message?.layout))
  const [audioOpen, setAudioOpen] = useState(Boolean(message?.quelle))
  const [audioBusy, setAudioBusy] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [quelleDisplay, setQuelleDisplay] = useState(message?.quelle ?? '')
  const [layoutFields, setLayoutFields] = useState<LayoutFormState>(() =>
    layoutFormFromMessage(message),
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (message) {
      setId(message.id)
      setTrigger(message.trigger)
      setMascot(message.mascot)
      setPlacement(message.placement)
      setText(message.text)
      setMilestone(message.milestone !== undefined ? String(message.milestone) : '0')
      setSlug(message.slug ?? stationSlugs[0] ?? '')
      setFestMode(!message.modes || message.modes.includes('fest'))
      setHeftMode(!message.modes || message.modes.includes('heft'))
      setLayoutFields(layoutFormFromMessage(message))
      setLayoutOpen(Boolean(message.layout))
      setAudioOpen(Boolean(message.quelle))
      setQuelleDisplay(message.quelle ?? '')
    }
  }, [message, stationSlugs])

  useEffect(() => {
    if (mascot === 'duo') {
      setPlacement('duo-split')
    }
  }, [mascot])

  function buildModesBody(): { modes?: CoachMode[] | null } {
    if (festMode && heftMode) {
      return mode === 'edit' ? { modes: null } : {}
    }
    const modes: CoachMode[] = []
    if (festMode) modes.push('fest')
    if (heftMode) modes.push('heft')
    if (modes.length === 0) {
      return mode === 'edit' ? { modes: null } : {}
    }
    return { modes }
  }

  function buildLayoutBody(): { layout?: CoachMessageLayout } {
    const layout = buildLayoutPayload(layoutFields)
    if (layout !== undefined) {
      return { layout }
    }
    return {}
  }

  async function handleAudioUpload(file: File) {
    if (mode !== 'edit' || !message) {
      return
    }
    setAudioError(null)
    setAudioBusy(true)
    const form = new FormData()
    form.set('messageId', message.id)
    form.set('file', file)
    form.set('collision', 'replace')
    try {
      const res = await fetch('/api/mpz/coach-audio/ingest', {
        method: 'POST',
        body: form,
      })
      const json = (await res.json()) as { quelle?: string; message?: string }
      if (!res.ok) {
        setAudioError(json.message ?? `Upload fehlgeschlagen (${res.status})`)
        return
      }
      setQuelleDisplay(json.quelle ?? '')
      markMpzStudioDirty()
      await validateNow()
      router.refresh()
      onSuccess('Coach-Audio hochgeladen.')
    } catch {
      setAudioError('Upload fehlgeschlagen.')
    } finally {
      setAudioBusy(false)
    }
  }

  async function handleAudioRemove() {
    if (mode !== 'edit' || !message) {
      return
    }
    setAudioError(null)
    setAudioBusy(true)
    try {
      const res = await fetch(
        `/api/mpz/coach/messages/${encodeURIComponent(message.id)}`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ quelle: null }),
        },
      )
      const json = (await res.json()) as { message?: string }
      if (!res.ok) {
        setAudioError(json.message ?? `Entfernen fehlgeschlagen (${res.status})`)
        return
      }
      setQuelleDisplay('')
      markMpzStudioDirty()
      await validateNow()
      router.refresh()
      onSuccess('Coach-Audio entfernt.')
    } catch {
      setAudioError('Entfernen fehlgeschlagen.')
    } finally {
      setAudioBusy(false)
    }
  }

  function handleUploadClick() {
    if (audioBusy || mode !== 'edit' || !message) {
      return
    }
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.wav,audio/wav'
    input.onchange = () => {
      const file = input.files?.[0]
      if (file) {
        void handleAudioUpload(file)
      }
    }
    input.click()
  }

  async function persistLayoutReset() {
    if (mode !== 'edit' || !message) {
      setLayoutFields(emptyLayoutForm())
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/mpz/coach/messages/${encodeURIComponent(message.id)}`,
          {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ layout: null }),
          },
        )
        const json = (await res.json()) as { message?: string }
        if (!res.ok) {
          setError(json.message ?? `Fehler (${res.status})`)
          return
        }
        setLayoutFields(emptyLayoutForm())
        markMpzStudioDirty()
        await validateNow()
        router.refresh()
        onSuccess('Layout auf Standard zurückgesetzt.')
      } catch {
        setError('Zurücksetzen fehlgeschlagen.')
      }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        if (mode === 'add') {
          const body: Record<string, unknown> = {
            id: id.trim(),
            trigger,
            mascot,
            placement,
            text,
            ...buildModesBody(),
            ...buildLayoutBody(),
          }
          if (trigger === 'hub-milestone') {
            body.milestone = Number.parseInt(milestone, 10)
          }
          if (trigger === 'room-first') {
            body.slug = slug
          }
          const res = await fetch('/api/mpz/coach/messages', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
          })
          const json = (await res.json()) as { message?: string }
          if (!res.ok) {
            setError(json.message ?? `Fehler (${res.status})`)
            return
          }
        } else {
          const body: Record<string, unknown> = {
            mascot,
            placement,
            text,
            ...buildModesBody(),
            ...buildLayoutBody(),
          }
          if (trigger === 'hub-milestone') {
            body.milestone = Number.parseInt(milestone, 10)
          }
          if (trigger === 'room-first') {
            body.slug = slug
          }
          if (message?.layout && !('layout' in body)) {
            body.layout = null
          }
          const res = await fetch(
            `/api/mpz/coach/messages/${encodeURIComponent(message!.id)}`,
            {
              method: 'PATCH',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(body),
            },
          )
          const json = (await res.json()) as { message?: string }
          if (!res.ok) {
            setError(json.message ?? `Fehler (${res.status})`)
            return
          }
        }
        markMpzStudioDirty()
        await validateNow()
        router.refresh()
        onSuccess(mode === 'add' ? 'Coach-Message angelegt.' : 'Coach-Message gespeichert.')
      } catch {
        setError('Speichern fehlgeschlagen.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-gs39-sm border border-border-1 bg-bg-1 p-4">
      {mode === 'add' && (
        <div className="mb-3">
          <label className={labelClassName()} htmlFor="coach-id">
            ID
          </label>
          <input
            id="coach-id"
            className={fieldClassName()}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="hub-milestone-3"
            required
          />
        </div>
      )}

      {mode === 'add' && (
        <div className="mb-3">
          <label className={labelClassName()} htmlFor="coach-trigger">
            Trigger
          </label>
          <select
            id="coach-trigger"
            className={fieldClassName()}
            value={trigger}
            onChange={(e) => setTrigger(e.target.value as CoachTrigger)}
          >
            {TRIGGERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      )}

      {mode === 'edit' && (
        <p className="mb-3 text-xs text-fg-3">
          Trigger: <code className="text-fg-2">{trigger}</code> (nicht änderbar)
        </p>
      )}

      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClassName()} htmlFor="coach-mascot">
            Maskottchen
          </label>
          <select
            id="coach-mascot"
            className={fieldClassName()}
            value={mascot}
            onChange={(e) => setMascot(e.target.value as CoachMascot)}
          >
            {MASCOTS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClassName()} htmlFor="coach-placement">
            Placement
          </label>
          <select
            id="coach-placement"
            className={fieldClassName()}
            value={placement}
            onChange={(e) => setPlacement(e.target.value as CoachPlacement)}
            disabled={mascot === 'duo'}
          >
            {PLACEMENTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {trigger === 'hub-milestone' && (
        <div className="mb-3">
          <label className={labelClassName()} htmlFor="coach-milestone">
            Milestone (0–{stationCount - 1})
          </label>
          <input
            id="coach-milestone"
            type="number"
            min={0}
            max={stationCount - 1}
            className={fieldClassName()}
            value={milestone}
            onChange={(e) => setMilestone(e.target.value)}
            required
          />
        </div>
      )}

      {trigger === 'room-first' && (
        <div className="mb-3">
          <label className={labelClassName()} htmlFor="coach-slug">
            Station (slug)
          </label>
          <select
            id="coach-slug"
            className={fieldClassName()}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          >
            {stationSlugs.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-3">
        <span className={labelClassName()}>Modi (leer = fest + heft)</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-fg-1">
            <input
              type="checkbox"
              checked={festMode}
              onChange={(e) => setFestMode(e.target.checked)}
            />
            fest
          </label>
          <label className="flex items-center gap-2 text-sm text-fg-1">
            <input
              type="checkbox"
              checked={heftMode}
              onChange={(e) => setHeftMode(e.target.checked)}
            />
            heft
          </label>
        </div>
      </div>

      <div className="mb-3">
        <label className={labelClassName()} htmlFor="coach-text">
          Text
        </label>
        <textarea
          id="coach-text"
          className={`${fieldClassName()} min-h-[5rem]`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
      </div>

      <div className="mb-3 rounded-gs39-sm border border-border-1 bg-bg-2 p-3">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left text-sm font-semibold text-fg-1"
          onClick={() => setAudioOpen((open) => !open)}
          aria-expanded={audioOpen}
        >
          Audio (optional)
          <span className="text-fg-3">{audioOpen ? '▾' : '▸'}</span>
        </button>
        {audioOpen && (
          <div className="mt-3 space-y-3">
            <p className="text-xs text-fg-3">
              Autoplay beim Einblenden — nach QR-Scan auf iPhone testen. Nur WAV,
              ca. 5–20 Sekunden.
            </p>
            {mode === 'add' ? (
              <p className="text-xs text-fg-2">
                Message zuerst speichern, dann Clip hochladen.
              </p>
            ) : (
              <>
                {quelleDisplay ? (
                  <p className="text-xs text-fg-2">
                    Quelle: <code className="text-fg-1">{quelleDisplay}</code>
                  </p>
                ) : (
                  <p className="text-xs text-fg-3">Kein Clip hinterlegt.</p>
                )}
                {audioError && (
                  <p className="text-xs text-brand-red">{audioError}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={audioBusy || isPending}
                    onClick={handleUploadClick}
                    className="rounded-gs39-sm bg-accent px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {quelleDisplay ? 'Clip ersetzen' : 'WAV hochladen'}
                  </button>
                  {quelleDisplay ? (
                    <button
                      type="button"
                      disabled={audioBusy || isPending}
                      onClick={() => void handleAudioRemove()}
                      className="rounded-gs39-sm border border-border-1 px-3 py-1.5 text-sm font-semibold text-fg-2 disabled:opacity-50"
                    >
                      Audio entfernen
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mb-3 rounded-gs39-sm border border-border-1 bg-bg-2 p-3">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left text-sm font-semibold text-fg-1"
          onClick={() => setLayoutOpen((open) => !open)}
          aria-expanded={layoutOpen}
        >
          Layout (optional)
          <span className="text-fg-3">{layoutOpen ? '▾' : '▸'}</span>
        </button>
        {layoutOpen && (
          <div className="mt-3 space-y-3">
            <p className="text-xs text-fg-3">{placementLayoutHint(placement)}</p>
            <p className="text-xs text-fg-3">
              Leere Felder = Standard. Am Gerät testen (Hub oder Raum). Werte sind
              nicht 1:1 zwischen Placements übertragbar.
            </p>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-fg-1">
                <input
                  type="checkbox"
                  checked={layoutFields.mascotFlipX}
                  onChange={(e) =>
                    setLayoutFields((prev) => ({
                      ...prev,
                      mascotFlipX: e.target.checked,
                    }))
                  }
                />
                Figur horizontal spiegeln (mascotFlipX)
              </label>
              <label className="flex items-center gap-2 text-sm text-fg-1">
                <input
                  type="checkbox"
                  checked={layoutFields.mascotFlipY}
                  onChange={(e) =>
                    setLayoutFields((prev) => ({
                      ...prev,
                      mascotFlipY: e.target.checked,
                    }))
                  }
                />
                Figur vertikal spiegeln (mascotFlipY)
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {LAYOUT_FIELD_META.map(({ key, label, step }) => {
                const clamp = COACH_LAYOUT_CLAMPS[key]
                return (
                  <div key={key}>
                    <label className={labelClassName()} htmlFor={`coach-layout-${key}`}>
                      {label}
                    </label>
                    <input
                      id={`coach-layout-${key}`}
                      type="number"
                      step={step}
                      min={clamp.min}
                      max={clamp.max}
                      className={fieldClassName()}
                      value={layoutFields.fields[key]}
                      onChange={(e) =>
                        setLayoutFields((prev) => ({
                          ...prev,
                          fields: { ...prev.fields, [key]: e.target.value },
                        }))
                      }
                    />
                    <p className="mt-0.5 text-xs text-fg-3">
                      {clamp.min}–{clamp.max}
                    </p>
                  </div>
                )
              })}
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => void persistLayoutReset()}
              className="rounded-gs39-sm border border-border-1 px-3 py-1.5 text-sm font-semibold text-fg-2 disabled:opacity-50"
            >
              Auf Standard
            </button>
          </div>
        )}
      </div>

      {trigger === 'hub-milestone' && (
        <p className="mb-3 text-xs text-fg-3">
          Hinweis: Mehrere Messages mit gleichem milestone sind erlaubt; die Runtime
          wählt die höchste passende Marke.
        </p>
      )}

      {error && <p className="mb-2 text-sm text-brand-red">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-gs39-sm bg-accent px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Speichern
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-gs39-sm border border-border-1 px-3 py-1.5 text-sm font-semibold text-fg-2"
        >
          Abbrechen
        </button>
      </div>
    </form>
  )
}
