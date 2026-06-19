'use client'

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

function fieldClassName(): string {
  return 'w-full rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-fg-1'
}

function labelClassName(): string {
  return 'mb-1 block text-xs font-semibold text-fg-3'
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
          <label className={labelClassName()} htmlFor="gruppe-id">
            ID
          </label>
          <input
            id="gruppe-id"
            className={fieldClassName()}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="gruesse"
            required
          />
        </div>
      )}
      <div className="mb-3">
        <label className={labelClassName()} htmlFor="gruppe-text">
          Gruppentext
        </label>
        <textarea
          id="gruppe-text"
          className={`${fieldClassName()} min-h-[4rem]`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
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
