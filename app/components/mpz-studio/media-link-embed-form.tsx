'use client'

import { MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import type { MediaFormState } from '@/components/mpz-studio/media-ingest-form'
import {
  mpzFieldClassName,
  mpzLabelClassName,
} from '@/components/mpz-studio/mpz-form-primitives'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
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
  formId?: string
  hideSubmit?: boolean
  onStateChange?: (state: MediaFormState) => void
  onSuccess?: () => void
}

export function MediaLinkEmbedForm({
  slug,
  typ,
  globalSuffixes,
  formId,
  hideSubmit = false,
  onStateChange,
  onSuccess,
}: MediaLinkEmbedFormProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const [mediumId, setMediumId] = useState('')
  const [form, setForm] = useState<LinkEmbedFormValues>(() =>
    defaultLinkEmbedFormValues(typ, globalSuffixes),
  )
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isPending, startTransition] = useTransition()

  const canSubmit = isLinkEmbedFormValid(typ, form, globalSuffixes)
  const busy = submitting || isPending

  useEffect(() => {
    onStateChange?.({ canSubmit, busy })
  }, [canSubmit, busy, onStateChange])

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

    setSubmitting(true)
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

      setMediumId('')
      setForm(defaultLinkEmbedFormValues(typ, globalSuffixes))
      markMpzStudioDirty()
      await validateNow()
      startTransition(() => {
        router.refresh()
      })
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Netzwerkfehler')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="med-create-id" className={mpzLabelClassName()}>
          ID (optional)
        </label>
        <input
          id="med-create-id"
          type="text"
          pattern="[a-z0-9][a-z0-9-]*"
          placeholder={`${slug}-${typ}`}
          value={mediumId}
          onChange={(e) => setMediumId(e.target.value)}
          className={mpzFieldClassName()}
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

      {!hideSubmit && (
        <button
          type="submit"
          disabled={busy || !canSubmit}
          className="rounded-gs39-sm bg-accent px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {busy ? 'Speichert …' : typ === 'link' ? 'Link anlegen' : 'Embed anlegen'}
        </button>
      )}

      {error && <MpzFormAlert variant="error">{error}</MpzFormAlert>}
    </form>
  )
}
