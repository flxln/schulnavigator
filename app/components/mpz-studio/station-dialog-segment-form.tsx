'use client'

import { MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import {
  mpzButtonClassName,
  mpzFieldClassName,
  mpzLabelClassName,
} from '@/components/mpz-studio/mpz-form-primitives'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import type { DialogBubbleTail, DialogGruppe, DialogRolle, DialogSegment } from '@/lib/types'
import { segmentHasAudio } from '@/lib/dialog-display'

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
  const [hasAudio, setHasAudio] = useState(
    segment ? segmentHasAudio(segment) : false,
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (segment) {
      setId(segment.id)
      setRolle(segment.rolle)
      setText(segment.text)
      setGruppe(segment.gruppe ?? '')
      setTail(segment.tail ?? '')
      setHasAudio(segmentHasAudio(segment))
    }
  }, [segment])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        if (mode === 'add') {
          const body: Record<string, unknown> = { rolle, text, hasAudio }
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
          const body: Record<string, unknown> = { text, rolle, hasAudio }
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
          <label className={mpzLabelClassName()} htmlFor="segment-id">
            ID (optional, Auto wenn leer)
          </label>
          <input
            id="segment-id"
            className={mpzFieldClassName()}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="d10"
          />
        </div>
      )}
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={mpzLabelClassName()} htmlFor="segment-rolle">
            Rolle
          </label>
          <select
            id="segment-rolle"
            className={mpzFieldClassName()}
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
          <label className={mpzLabelClassName()} htmlFor="segment-gruppe">
            Gruppe
          </label>
          <select
            id="segment-gruppe"
            className={mpzFieldClassName()}
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
        <label className={mpzLabelClassName()} htmlFor="segment-tail">
          tail
        </label>
        <select
          id="segment-tail"
          className={mpzFieldClassName()}
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
        <label className="flex cursor-pointer items-center gap-2 text-sm text-fg-1">
          <input
            type="checkbox"
            checked={hasAudio}
            onChange={(e) => setHasAudio(e.target.checked)}
            className="size-4 rounded border-border-1"
          />
          Mit Audio (WAV-Clip)
        </label>
        <p className="mt-1 text-xs text-fg-3">
          Ohne Häkchen: nur Sprechblase im Raum, Tippen zum Weiter.
        </p>
      </div>
      <div className="mb-3">
        <label className={mpzLabelClassName()} htmlFor="segment-text">
          Text
        </label>
        <textarea
          id="segment-text"
          className={`${mpzFieldClassName()} min-h-[5rem]`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      {error && <MpzFormAlert variant="error">{error}</MpzFormAlert>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className={`${mpzButtonClassName('primary')} !min-h-9 px-3 py-1.5 text-sm`}
        >
          Speichern
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`${mpzButtonClassName('secondary')} !min-h-9 px-3 py-1.5 text-sm`}
        >
          Abbrechen
        </button>
      </div>
    </form>
  )
}
