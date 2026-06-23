'use client'

import { MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import {
  mpzFieldClassName,
  mpzLabelClassName,
} from '@/components/mpz-studio/mpz-form-primitives'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'

export type StationDialogGruppeFormProps = {
  slug: string
  mode: 'add' | 'edit'
  gruppeId?: string
  initialText?: string
  onCancel: () => void
  onSuccess: (message: string) => void
}

export function StationDialogGruppeForm({
  slug,
  mode,
  gruppeId,
  initialText = '',
  onCancel,
  onSuccess,
}: StationDialogGruppeFormProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const [id, setId] = useState(gruppeId ?? '')
  const [text, setText] = useState(initialText)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const url =
          mode === 'add'
            ? `/api/mpz/stations/${encodeURIComponent(slug)}/dialog/gruppen`
            : `/api/mpz/stations/${encodeURIComponent(slug)}/dialog/gruppen/${encodeURIComponent(gruppeId!)}`
        const body = mode === 'add' ? { id: id.trim(), text } : { text }
        const res = await fetch(url, {
          method: mode === 'add' ? 'POST' : 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        })
        const json = (await res.json()) as { message?: string }
        if (!res.ok) {
          setError(json.message ?? `Fehler (${res.status})`)
          return
        }
        markMpzStudioDirty()
        await validateNow()
        router.refresh()
        onSuccess(mode === 'add' ? 'Gruppe angelegt.' : 'Gruppe gespeichert.')
      } catch {
        setError('Speichern fehlgeschlagen.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-gs39-sm border border-border-1 bg-bg-1 p-4">
      {mode === 'add' && (
        <div className="mb-3">
          <label className={mpzLabelClassName()} htmlFor="gruppe-id">
            ID
          </label>
          <input
            id="gruppe-id"
            className={mpzFieldClassName()}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="gruesse"
            required
          />
        </div>
      )}
      <div className="mb-3">
        <label className={mpzLabelClassName()} htmlFor="gruppe-text">
          Gruppentext
        </label>
        <textarea
          id="gruppe-text"
          className={`${mpzFieldClassName()} min-h-[4rem]`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
      </div>
      {error && <MpzFormAlert variant="error">{error}</MpzFormAlert>}
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
