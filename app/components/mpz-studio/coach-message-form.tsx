'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import type {
  CoachMascot,
  CoachMessage,
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
          }
          if (trigger === 'hub-milestone') {
            body.milestone = Number.parseInt(milestone, 10)
          }
          if (trigger === 'room-first') {
            body.slug = slug
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
