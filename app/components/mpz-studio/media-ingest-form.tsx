'use client'

import { MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import {
  mpzFieldClassName,
  mpzLabelClassName,
} from '@/components/mpz-studio/mpz-form-primitives'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import type { MpzValidationReport } from '@/lib/mpz-studio-overview'
import { getUploadFolder, UPLOAD_RULES, type UploadTyp } from '@/lib/mpz-upload-rules'
import { MPZ_HUB_SLUGS } from '@/lib/schoolhouse-hub-map'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import type { MediumTyp } from '@/lib/types'

const TYPEN = [
  { value: 'audio', label: 'Audio (.mp3 .wav .m4a)' },
  { value: 'video', label: 'Video (.mp4)' },
  { value: 'foto', label: 'Foto (.jpg .jpeg .webp)' },
  { value: 'text', label: 'Text (.md .txt)' },
] as const

export type MediaFormState = {
  canSubmit: boolean
  busy: boolean
}

interface SuccessState {
  slug: string
  quelle: string
  id: string
}

export type MediaIngestFormProps = {
  initialSlug?: string
  fixedTyp?: MediumTyp
  hideSlugSelect?: boolean
  hideTypSelect?: boolean
  formId?: string
  hideSubmit?: boolean
  onStateChange?: (state: MediaFormState) => void
  onSuccess?: () => void
}

export function MediaIngestForm({
  initialSlug,
  fixedTyp,
  hideSlugSelect = false,
  hideTypSelect = false,
  formId,
  hideSubmit = false,
  onStateChange,
  onSuccess,
}: MediaIngestFormProps) {
  const router = useRouter()
  const { applyReport, validateNow } = useStudioValidation()
  const [, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const defaultSlug =
    initialSlug && MPZ_HUB_SLUGS.includes(initialSlug as (typeof MPZ_HUB_SLUGS)[number])
      ? initialSlug
      : MPZ_HUB_SLUGS[0]
  const uploadTyp = (fixedTyp ?? 'audio') as UploadTyp
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<SuccessState | null>(null)

  const pathPreview = `/media/${defaultSlug}/${getUploadFolder(uploadTyp)}/…`
  const accept = UPLOAD_RULES[uploadTyp].extensions.join(',')

  useEffect(() => {
    onStateChange?.({ canSubmit: file !== null, busy })
  }, [file, busy, onStateChange])

  function pickFile(next: File) {
    setFile(next)
    setError(null)
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (picked) {
      pickFile(picked)
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) {
      pickFile(dropped)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!file) return

    setError(null)
    setSuccess(null)
    setBusy(true)
    const form = e.currentTarget
    const data = new FormData(form)
    data.set('file', file)
    const slug = String(data.get('slug') ?? defaultSlug)
    try {
      const res = await fetch('/api/mpz/media/ingest', {
        method: 'POST',
        body: data,
      })
      const json = (await res.json()) as {
        quelle?: string
        medium?: { id?: string }
        message?: string
        mtime?: string | null
        validation?: MpzValidationReport | null
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
      if (json.validation) {
        applyReport(json.validation, json.mtime ?? json.validation.stationsModifiedAt)
      } else {
        await validateNow()
      }
      markMpzStudioDirty()
      setFile(null)
      form.reset()
      startTransition(() => {
        router.refresh()
      })
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Netzwerkfehler')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      {!hideSlugSelect && (
        <div>
          <label htmlFor="media-ingest-slug" className={mpzLabelClassName()}>
            Station (slug)
          </label>
          <select
            id="media-ingest-slug"
            name="slug"
            required
            defaultValue={defaultSlug}
            className={mpzFieldClassName()}
          >
            {MPZ_HUB_SLUGS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {hideSlugSelect && <input type="hidden" name="slug" value={defaultSlug} />}

      {!hideTypSelect && (
        <div>
          <label htmlFor="media-ingest-typ" className={mpzLabelClassName()}>
            Typ
          </label>
          <select
            id="media-ingest-typ"
            name="typ"
            required
            defaultValue={fixedTyp ?? 'audio'}
            className={mpzFieldClassName()}
          >
            {TYPEN.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {hideTypSelect && fixedTyp && <input type="hidden" name="typ" value={fixedTyp} />}

      <div>
        <span className={mpzLabelClassName()}>Datei</span>
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              if (!busy) fileInputRef.current?.click()
            }
          }}
          onClick={() => {
            if (!busy) fileInputRef.current?.click()
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-gs39-md border-2 border-dashed border-border-1 bg-bg-1 px-4 py-10 text-center transition-colors hover:border-accent hover:bg-accent/5"
        >
          <p className="text-sm text-fg-2">
            {file ? file.name : 'Datei hierher ziehen oder klicken'}
          </p>
          {file && (
            <p className="text-xs text-fg-3">
              {(file.size / 1024).toFixed(0)} KB — andere Datei wählen
            </p>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={busy}
          onChange={handleFileInputChange}
          tabIndex={-1}
          aria-hidden
        />
      </div>

      <div className="rounded-gs39-sm border border-border-1 bg-bg-2 px-3 py-2">
        <span className="font-mono text-xs text-fg-3">Dateipfad: {pathPreview}</span>
      </div>

      <div>
        <label htmlFor="media-ingest-untertitel" className={mpzLabelClassName()}>
          Untertitel (optional)
        </label>
        <input
          id="media-ingest-untertitel"
          type="text"
          name="untertitel"
          className={mpzFieldClassName()}
        />
      </div>

      {!hideSubmit && (
        <button
          type="submit"
          disabled={busy || !file}
          className="rounded-gs39-sm bg-accent px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {busy ? 'Lädt hoch …' : 'Hochladen'}
        </button>
      )}

      {error && <MpzFormAlert variant="error">{error}</MpzFormAlert>}

      {success && !onSuccess && (
        <MpzFormAlert variant="success">
          Hochgeladen: <code>{success.quelle}</code> (id <code>{success.id}</code>)
        </MpzFormAlert>
      )}
    </form>
  )
}
