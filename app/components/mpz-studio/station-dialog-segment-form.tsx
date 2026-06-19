'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import type { DialogBubbleTail, DialogGruppe, DialogRolle, DialogSegment } from '@/lib/types'

export type StationDialogSegmentFormProps = {
  slug: string
  mode: 'add' | 'edit'
  segment?: DialogSegment
  gruppen: DialogGruppe[]
  onCancel: () => void
  onSuccess: (message: string) => void
}

const ROLLEN: DialogRolle[] = ['frieda', 'otto', 'beide']
const TAILS: DialogBubbleTail[] = ['left', 'right', 'center']

function fieldClassName(): string {
  return 'w-full rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-fg-1'
}

function labelClassName(): string {
  return 'mb-1 block text-xs font-semibold text-fg-3'
}

export function StationDialogSegmentForm({
  slug,
  mode,
  segment,
  gruppen,
  onCancel,
  onSuccess,
}: StationDialogSegmentFormProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const [id, setId] = useState(segment?.id ?? '')
  const [rolle, setRolle] = useState<DialogRolle>(segment?.rolle ?? 'frieda')
  const [text, setText] = useState(segment?.text ?? '')
  const [gruppe, setGruppe] = useState(segment?.gruppe ?? '')
  const [tail, setTail] = useState(segment?.tail ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (segment) {
      setId(segment.id)
      setRolle(segment.rolle)
      setText(segment.text)
      setGruppe(segment.gruppe ?? '')
      setTail(segment.tail ?? '')
    }
  }, [segment])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        if (mode === 'add') {
          const body: Record<string, unknown> = { rolle, text }
          if (id.trim()) body.id = id.trim()
          if (gruppe) body.gruppe = gruppe
          if (tail) body.tail = tail
          const res = await fetch(
            `/api/mpz/stations/${encodeURIComponent(slug)}/dialog/segmente`,
            {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(body),
            },
          )
          const json = (await res.json()) as { message?: string }
          if (!res.ok) {
            setError(json.message ?? `Fehler (${res.status})`)
            return
          }
        } else {
          const body: Record<string, unknown> = { text, rolle }
          body.gruppe = gruppe || null
          body.tail = tail || null
          const res = await fetch(
            `/api/mpz/stations/${encodeURIComponent(slug)}/dialog/segmente/${encodeURIComponent(segment!.id)}`,
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
        onSuccess(mode === 'add' ? 'Segment angelegt.' : 'Segment gespeichert.')
      } catch {
        setError('Speichern fehlgeschlagen.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-gs39-sm border border-border-1 bg-bg-1 p-4">
      {mode === 'add' && (
        <div className="mb-3">
          <label className={labelClassName()} htmlFor="segment-id">
            ID (optional, Auto wenn leer)
          </label>
          <input
            id="segment-id"
            className={fieldClassName()}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="d10"
          />
        </div>
      )}
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClassName()} htmlFor="segment-rolle">
            Rolle
          </label>
          <select
            id="segment-rolle"
            className={fieldClassName()}
            value={rolle}
            onChange={(e) => setRolle(e.target.value as DialogRolle)}
          >
            {ROLLEN.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClassName()} htmlFor="segment-gruppe">
            Gruppe
          </label>
          <select
            id="segment-gruppe"
            className={fieldClassName()}
            value={gruppe}
            onChange={(e) => setGruppe(e.target.value)}
          >
            <option value="">— keine —</option>
            {gruppen.map((g) => (
              <option key={g.id} value={g.id}>
                {g.id}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-3">
        <label className={labelClassName()} htmlFor="segment-tail">
          tail
        </label>
        <select
          id="segment-tail"
          className={fieldClassName()}
          value={tail}
          onChange={(e) => setTail(e.target.value)}
        >
          <option value="">— Standard —</option>
          {TAILS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className={labelClassName()} htmlFor="segment-text">
          Text
        </label>
        <textarea
          id="segment-text"
          className={`${fieldClassName()} min-h-[5rem]`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
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
