'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  defaultLinkEmbedFormValues,
  isLinkEmbedFormValid,
  MediumLinkEmbedFields,
  type LinkEmbedFormValues,
} from '@/components/mpz-studio/medium-link-embed-fields'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'

export type MediaLinkEmbedFormProps = {
  slug: string
  typ: 'link' | 'embed'
  globalSuffixes: readonly string[]
  onSuccess?: (message: string) => void
}

function fieldClassName(): string {
  return 'w-full rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-fg-1'
}

function labelClassName(): string {
  return 'mb-1 block text-xs font-semibold text-fg-3'
}

export function MediaLinkEmbedForm({
  slug,
  typ,
  globalSuffixes,
  onSuccess,
}: MediaLinkEmbedFormProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const [mediumId, setMediumId] = useState('')
  const [form, setForm] = useState<LinkEmbedFormValues>(() =>
    defaultLinkEmbedFormValues(typ, globalSuffixes),
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function updateField<K extends keyof LinkEmbedFormValues>(
    key: K,
    value: LinkEmbedFormValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!isLinkEmbedFormValid(typ, form, globalSuffixes)) {
      setError('Bitte eine gültige https-URL eingeben (Embed: Allowlist-Domain).')
      return
    }

    const body: Record<string, unknown> = {
      typ,
      quelle: form.quelle.trim(),
    }

    const id = mediumId.trim()
    if (id) {
      body.id = id
    }

    const untertitel = form.untertitel.trim()
    if (untertitel) {
      body.untertitel = untertitel
    }

    const thumbnail = form.thumbnail.trim()
    if (thumbnail) {
      body.thumbnail = thumbnail
    }

    if (typ === 'link' && form.openInExternal) {
      body.openIn = 'external'
    }

    if (typ === 'embed' && form.embedAllow.length > 0) {
      body.embedAllow = form.embedAllow
    }

    try {
      const res = await fetch(`/api/mpz/stations/${encodeURIComponent(slug)}/medien`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = (await res.json()) as { message?: string; station?: { medien?: { id: string }[] } }

      if (!res.ok) {
        setError(json.message ?? `Fehler (${res.status})`)
        return
      }

      const createdId =
        json.station?.medien?.[json.station.medien.length - 1]?.id ?? id ?? typ
      const message = `Medium „${createdId}" angelegt. Für /raum/${slug} ggf. Dev-Server neu starten (Modul-Cache).`
      onSuccess?.(message)
      setMediumId('')
      setForm(defaultLinkEmbedFormValues(typ, globalSuffixes))
      markMpzStudioDirty()
      await validateNow()
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Netzwerkfehler')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="med-create-id" className={labelClassName()}>
          ID (optional)
        </label>
        <input
          id="med-create-id"
          type="text"
          pattern="[a-z0-9][a-z0-9-]*"
          placeholder={`${slug}-${typ}`}
          value={mediumId}
          onChange={(e) => setMediumId(e.target.value)}
          className={fieldClassName()}
        />
        <p className="mt-1 text-xs text-fg-3">
          Leer lassen für automatische ID (z. B. <code className="font-mono">{slug}-{typ}</code>).
        </p>
      </div>

      <MediumLinkEmbedFields
        typ={typ}
        slug={slug}
        globalSuffixes={globalSuffixes}
        values={form}
        onChange={updateField}
        idPrefix="med-create"
      />

      <button
        type="submit"
        disabled={isPending || !isLinkEmbedFormValid(typ, form, globalSuffixes)}
        className="rounded-gs39-sm bg-accent px-4 py-2 font-semibold text-white disabled:opacity-50"
      >
        {isPending ? 'Speichert …' : typ === 'link' ? 'Link anlegen' : 'Embed anlegen'}
      </button>

      {error && (
        <p
          role="alert"
          className="rounded-gs39-sm border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </p>
      )}
    </form>
  )
}
