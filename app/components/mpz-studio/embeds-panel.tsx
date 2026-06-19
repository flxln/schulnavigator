'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'

export type LinkEmbedMediumRow = {
  slug: string
  stationTitle: string
  mediumId: string
  typ: 'link' | 'embed'
  quelle: string
  embedAllow?: string[]
  openIn?: string
}

export type EmbedsPanelProps = {
  suffixes: readonly string[]
  mediaRows: readonly LinkEmbedMediumRow[]
}

function fieldClassName(): string {
  return 'w-full rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-fg-1'
}

function labelClassName(): string {
  return 'mb-1 block text-xs font-semibold text-fg-3'
}

export function EmbedsPanel({ suffixes, mediaRows }: EmbedsPanelProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const [draft, setDraft] = useState<string[]>(() => [...suffixes])
  const [newSuffix, setNewSuffix] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const dirty =
    [...draft].sort().join(',') !== [...suffixes].sort().join(',')

  function addSuffix() {
    const trimmed = newSuffix.trim().toLowerCase()
    if (!trimmed) return
    if (draft.includes(trimmed)) {
      setError(`„${trimmed}" ist bereits in der Liste.`)
      return
    }
    setDraft((prev) => [...prev, trimmed].sort())
    setNewSuffix('')
    setError(null)
  }

  function removeSuffix(suffix: string) {
    setDraft((prev) => prev.filter((s) => s !== suffix))
    setError(null)
  }

  async function handleSave() {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/mpz/embed-allowlist', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ suffixes: draft }),
        })
        const json = (await res.json()) as { message?: string }
        if (!res.ok) {
          if (res.status === 422 && json.message) {
            setError(
              'Entfernen nicht möglich — Domain noch in Nutzung. Details: ' +
                json.message,
            )
          } else {
            setError(json.message ?? `Fehler (${res.status})`)
          }
          return
        }
        markMpzStudioDirty()
        await validateNow()
        router.refresh()
        setSuccess('Globale Embed-Allowlist gespeichert.')
      } catch {
        setError('Speichern fehlgeschlagen.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <p className="text-sm text-fg-2">
          Erlaubte Domain-Suffixe für <code className="text-fg-1">typ: embed</code> in{' '}
          <code className="text-fg-1">stations.json</code>. Datei:{' '}
          <code className="text-fg-1">data/embed-allowlist.json</code>. CSP{' '}
          <code className="font-mono text-xs">frame-src</code> aktualisiert sich erst nach
          Dev-Server-Neustart oder <code className="font-mono text-xs">npm run build</code>.
        </p>

        {error && (
          <p
            role="alert"
            className="rounded-gs39-sm border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-gs39-sm border border-brand-green/30 bg-brand-green/10 px-3 py-2 text-sm text-fg-1">
            {success}
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {draft.map((suffix) => (
            <li
              key={suffix}
              className="flex items-center justify-between rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2"
            >
              <code className="font-mono text-sm text-fg-1">{suffix}</code>
              <button
                type="button"
                onClick={() => removeSuffix(suffix)}
                className="text-xs font-semibold text-brand-red hover:underline"
              >
                Entfernen
              </button>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[200px] flex-1">
            <label htmlFor="embed-suffix-new" className={labelClassName()}>
              Suffix hinzufügen
            </label>
            <input
              id="embed-suffix-new"
              type="text"
              value={newSuffix}
              onChange={(e) => setNewSuffix(e.target.value)}
              placeholder="example.com"
              className={`${fieldClassName()} font-mono text-xs`}
            />
          </div>
          <button
            type="button"
            onClick={addSuffix}
            className="rounded-gs39-sm border border-border-1 bg-bg-2 px-3 py-2 text-sm font-semibold text-fg-1 hover:bg-bg-3"
          >
            Hinzufügen
          </button>
          <button
            type="button"
            disabled={isPending || !dirty}
            onClick={() => void handleSave()}
            className="rounded-gs39-sm bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isPending ? 'Speichert …' : 'Allowlist speichern'}
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-fg-1">Link- und Embed-Medien</h2>
        {mediaRows.length === 0 ? (
          <p className="text-sm text-fg-3">Keine link/embed-Medien in stations.json.</p>
        ) : (
          <div className="overflow-x-auto rounded-gs39-md border border-border-1">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border-1 bg-bg-2 text-xs font-semibold uppercase tracking-wide text-fg-3">
                <tr>
                  <th className="px-3 py-2">Station</th>
                  <th className="px-3 py-2">Medium</th>
                  <th className="px-3 py-2">Typ</th>
                  <th className="px-3 py-2">Quelle</th>
                  <th className="px-3 py-2">embedAllow / openIn</th>
                </tr>
              </thead>
              <tbody>
                {mediaRows.map((row) => (
                  <tr key={`${row.slug}-${row.mediumId}`} className="border-b border-border-1">
                    <td className="px-3 py-2">
                      <Link
                        href={`/mpz/studio/stationen/${row.slug}?tab=medien`}
                        className="font-medium text-accent hover:underline"
                      >
                        {row.stationTitle}
                      </Link>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{row.mediumId}</td>
                    <td className="px-3 py-2">{row.typ}</td>
                    <td className="max-w-xs truncate px-3 py-2 font-mono text-xs" title={row.quelle}>
                      {row.quelle}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-fg-3">
                      {row.typ === 'embed'
                        ? row.embedAllow?.join(', ') ?? '(Standard-Allowlist)'
                        : row.openIn ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
