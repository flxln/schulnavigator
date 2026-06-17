'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MPZ_HUB_SLUGS } from '@/lib/schoolhouse-hub-map'

const TYPEN = [
  { value: 'audio', label: 'Audio (.mp3 .wav .m4a)' },
  { value: 'video', label: 'Video (.mp4)' },
  { value: 'foto', label: 'Foto (.jpg .jpeg .webp)' },
  { value: 'text', label: 'Text (.md .txt)' },
] as const

interface SuccessState {
  slug: string
  quelle: string
  id: string
}

export type MediaIngestFormProps = {
  initialSlug?: string
}

export function MediaIngestForm({ initialSlug }: MediaIngestFormProps) {
  const defaultSlug =
    initialSlug && MPZ_HUB_SLUGS.includes(initialSlug as (typeof MPZ_HUB_SLUGS)[number])
      ? initialSlug
      : MPZ_HUB_SLUGS[0]
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<SuccessState | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setBusy(true)
    const form = e.currentTarget
    const data = new FormData(form)
    const slug = String(data.get('slug') ?? '')
    try {
      const res = await fetch('/api/mpz/media/ingest', {
        method: 'POST',
        body: data,
      })
      const json = (await res.json()) as {
        quelle?: string
        medium?: { id?: string }
        message?: string
      }
      if (!res.ok) {
        setError(json.message ?? `Fehler (${res.status})`)
        return
      }
      setSuccess({
        slug,
        quelle: json.quelle ?? '',
        id: json.medium?.id ?? '',
      })
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Netzwerkfehler')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-fg-2">Station (slug)</span>
        <select
          name="slug"
          required
          defaultValue={defaultSlug}
          className="rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-fg-1"
        >
          {MPZ_HUB_SLUGS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-fg-2">Typ</span>
        <select
          name="typ"
          required
          className="rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-fg-1"
        >
          {TYPEN.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-fg-2">Datei</span>
        <input
          type="file"
          name="file"
          required
          className="rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-fg-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-fg-2">Untertitel (optional)</span>
        <input
          type="text"
          name="untertitel"
          className="rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-fg-1"
        />
      </label>

      <button
        type="submit"
        disabled={busy}
        className="rounded-gs39-sm bg-accent px-4 py-2 font-semibold text-white disabled:opacity-60"
      >
        {busy ? 'Lädt hoch …' : 'Hochladen'}
      </button>

      {error && (
        <p
          role="alert"
          className="rounded-gs39-sm border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      {success && (
        <div className="rounded-gs39-sm border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900">
          <p>
            Hochgeladen: <code>{success.quelle}</code> (id <code>{success.id}</code>)
          </p>
          <Link
            href={`/raum/${success.slug}`}
            className="font-semibold underline underline-offset-2"
          >
            Vorschau /raum/{success.slug}
          </Link>
        </div>
      )}
    </form>
  )
}
