'use client'

import {
  mpzButtonClassName,
  mpzFieldClassName,
  mpzLabelClassName,
} from '@/components/mpz-studio/mpz-form-primitives'
import { MpzDraftNotice, MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import {
  defaultLinkEmbedFormValues,
  MediumLinkEmbedFields,
  type LinkEmbedFormValues,
} from '@/components/mpz-studio/medium-link-embed-fields'
import {
  FOTO_RULE,
  MediumAssetUploadField,
} from '@/components/mpz-studio/medium-asset-upload-field'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import { isUploadTyp, UPLOAD_RULES } from '@/lib/mpz-upload-rules'
import type { MediumAssetField } from '@/lib/mpz-medium-asset-upload'
import type { Medium } from '@/lib/types'

const UPLOAD_DIRTY_HINT =
  'Bitte zuerst Änderungen speichern, bevor ein Bild hochgeladen wird.'

export type StationMediumEditFormProps = {
  slug: string
  medium: Medium
  globalSuffixes: readonly string[]
  onCancel: () => void
  onSuccess: (message: string) => void
}

const KB = 1024
const MB = 1024 * 1024

function formatMaxBytes(bytes: number): string {
  if (bytes >= MB) return `${Math.round(bytes / MB)} MB`
  return `${Math.round(bytes / KB)} KB`
}

export function canReplaceMediumFile(
  medium: Medium,
  formVideoSource: 'upload' | 'youtube',
): boolean {
  if (!isUploadTyp(medium.typ)) return false
  if (medium.typ === 'video') {
    return medium.videoSource !== 'youtube' && formVideoSource !== 'youtube'
  }
  return true
}

function mediumToForm(
  medium: Medium,
  globalSuffixes: readonly string[],
): LinkEmbedFormValues & {
  poster: string
  videoSource: 'upload' | 'youtube'
} {
  const linkEmbed =
    medium.typ === 'link' || medium.typ === 'embed'
      ? {
          untertitel: medium.untertitel ?? '',
          thumbnail: medium.thumbnail ?? '',
          quelle: medium.quelle ?? '',
          openInExternal: medium.openIn === 'external',
          embedAllow: medium.embedAllow ?? [...globalSuffixes],
        }
      : defaultLinkEmbedFormValues('link', globalSuffixes)

  return {
    ...linkEmbed,
    poster: medium.poster ?? '',
    videoSource: medium.videoSource ?? 'upload',
  }
}

function buildDiff(
  medium: Medium,
  form: ReturnType<typeof mediumToForm>,
  globalSuffixes: readonly string[],
): Record<string, unknown> {
  const patch: Record<string, unknown> = {}
  const initial = mediumToForm(medium, globalSuffixes)

  if (form.untertitel !== initial.untertitel) {
    patch.untertitel = form.untertitel
  }
  if (form.thumbnail !== initial.thumbnail) {
    patch.thumbnail = form.thumbnail
  }

  if (medium.typ === 'video') {
    if (form.poster !== initial.poster) {
      patch.poster = form.poster
    }
    if (form.videoSource !== initial.videoSource) {
      patch.videoSource = form.videoSource
    }
  }

  if (medium.typ === 'link' || medium.typ === 'embed') {
    if (form.quelle !== initial.quelle) {
      patch.quelle = form.quelle
    }
  }

  if (medium.typ === 'link') {
    const nextOpenIn = form.openInExternal ? 'external' : ''
    const initialOpenIn = initial.openInExternal ? 'external' : ''
    if (nextOpenIn !== initialOpenIn) {
      patch.openIn = nextOpenIn
    }
  }

  if (medium.typ === 'embed') {
    const sorted = (arr: readonly string[]) => [...arr].sort().join(',')
    if (sorted(form.embedAllow) !== sorted(initial.embedAllow)) {
      patch.embedAllow = form.embedAllow.length === 0 ? [] : form.embedAllow
    }
  }

  return patch
}

export function StationMediumEditForm({
  slug,
  medium,
  globalSuffixes,
  onCancel,
  onSuccess,
}: StationMediumEditFormProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const [form, setForm] = useState(() => mediumToForm(medium, globalSuffixes))
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileReplaceBusy, setFileReplaceBusy] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [assetUploadBusy, setAssetUploadBusy] = useState(false)
  const [thumbnailUploadError, setThumbnailUploadError] = useState<string | null>(null)
  const [posterUploadError, setPosterUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  const replaceAllowed = canReplaceMediumFile(medium, form.videoSource)
  const uploadTyp = isUploadTyp(medium.typ) ? medium.typ : null
  const uploadRule = uploadTyp ? UPLOAD_RULES[uploadTyp] : null
  const showSaveFirstHint =
    medium.typ === 'video' &&
    medium.videoSource === 'youtube' &&
    form.videoSource === 'upload'

  const isDirty = Object.keys(buildDiff(medium, form, globalSuffixes)).length > 0
  const assetUploadDisabled = isDirty

  const thumbnailAssetUpload = {
    uploadDisabled: assetUploadDisabled,
    uploadDisabledHint: assetUploadDisabled ? UPLOAD_DIRTY_HINT : undefined,
    onPickFile: (file: File) => void handleAssetUpload('thumbnail', file),
    busy: assetUploadBusy,
    uploadError: thumbnailUploadError,
  }

  useEffect(() => {
    setForm(mediumToForm(medium, globalSuffixes))
    setError(null)
  }, [medium, globalSuffixes])

  useEffect(() => {
    if (!replaceAllowed) {
      setSelectedFile(null)
      setFileError(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [replaceAllowed])

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateLinkEmbedField<K extends keyof LinkEmbedFormValues>(
    key: K,
    value: LinkEmbedFormValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function pickReplaceFile(file: File) {
    setFileError(null)
    setSelectedFile(file)
  }

  function handleReplaceFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (picked) {
      pickReplaceFile(picked)
    }
  }

  function handleReplaceDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleReplaceDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) {
      pickReplaceFile(dropped)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const patch = buildDiff(medium, form, globalSuffixes)
    if (Object.keys(patch).length === 0) {
      setError('Keine Änderungen zum Speichern.')
      return
    }

    try {
      const res = await fetch(
        `/api/mpz/stations/${encodeURIComponent(slug)}/medien/${encodeURIComponent(medium.id)}`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(patch),
        },
      )
      const json = (await res.json()) as { message?: string }

      if (!res.ok) {
        setError(json.message ?? `Fehler (${res.status})`)
        return
      }

      onSuccess(
        `Medium „${medium.id}" gespeichert. Für /raum/${slug} ggf. Dev-Server neu starten (Modul-Cache).`,
      )
      markMpzStudioDirty()
      await validateNow()
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Netzwerkfehler')
    }
  }

  async function handleAssetUpload(field: MediumAssetField, file: File) {
    const setError = field === 'thumbnail' ? setThumbnailUploadError : setPosterUploadError
    setError(null)

    if (assetUploadDisabled) {
      setError(UPLOAD_DIRTY_HINT)
      return
    }

    if (file.size > FOTO_RULE.maxBytes) {
      setError(`Datei zu groß (max. ${formatMaxBytes(FOTO_RULE.maxBytes)}).`)
      return
    }

    setAssetUploadBusy(true)
    try {
      const formData = new FormData()
      formData.set('file', file)

      const res = await fetch(
        `/api/mpz/stations/${encodeURIComponent(slug)}/medien/${encodeURIComponent(medium.id)}/${field}`,
        { method: 'POST', body: formData },
      )
      const json = (await res.json()) as {
        path?: string
        field?: MediumAssetField
        message?: string
        error?: string
      }

      if (!res.ok) {
        setError(json.message ?? json.error ?? `Fehler (${res.status})`)
        return
      }

      if (json.path) {
        if (field === 'thumbnail') {
          updateField('thumbnail', json.path)
        } else {
          updateField('poster', json.path)
        }
      }

      const label = field === 'thumbnail' ? 'Thumbnail' : 'Poster'
      onSuccess(
        `${label} für Medium „${medium.id}" gesetzt (${json.path ?? ''}). Für /raum/${slug} ggf. Dev-Server neu starten (Modul-Cache).`,
      )
      markMpzStudioDirty()
      await validateNow()
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Netzwerkfehler')
    } finally {
      setAssetUploadBusy(false)
    }
  }

  async function handleFileReplace() {
    setFileError(null)

    if (!selectedFile) {
      setFileError('Bitte zuerst eine Datei wählen.')
      return
    }

    if (!uploadTyp || !uploadRule) {
      return
    }

    if (selectedFile.size > uploadRule.maxBytes) {
      setFileError(
        `Datei zu groß (max. ${formatMaxBytes(uploadRule.maxBytes)}).`,
      )
      return
    }

    setFileReplaceBusy(true)
    try {
      const formData = new FormData()
      formData.set('file', selectedFile)

      const res = await fetch(
        `/api/mpz/stations/${encodeURIComponent(slug)}/medien/${encodeURIComponent(medium.id)}/file`,
        { method: 'POST', body: formData },
      )
      const json = (await res.json()) as {
        quelle?: string
        medium?: Medium
        fileReplaced?: boolean
        validation?: unknown
        message?: string
        error?: string
      }

      if (!res.ok) {
        setFileError(json.message ?? json.error ?? `Fehler (${res.status})`)
        return
      }

      onSuccess(
        `Datei für Medium „${medium.id}" ersetzt (${json.quelle ?? medium.quelle}). Für /raum/${slug} ggf. Dev-Server neu starten (Modul-Cache).`,
      )
      markMpzStudioDirty()
      await validateNow()
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Netzwerkfehler')
    } finally {
      setFileReplaceBusy(false)
    }
  }

  const quelleReadOnly =
    medium.typ === 'audio' ||
    medium.typ === 'video' ||
    medium.typ === 'foto' ||
    medium.typ === 'text'

  const busy = isPending || fileReplaceBusy || assetUploadBusy

  return (
    <div className="flex flex-col gap-4 border-t border-border-1 bg-bg-2 p-mpz-card-padding">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-fg-3">Medium bearbeiten</p>

        {isDirty && <MpzDraftNotice />}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`edit-med-id-${medium.id}`} className={mpzLabelClassName()}>
              ID (read-only)
            </label>
            <input
              id={`edit-med-id-${medium.id}`}
              type="text"
              readOnly
              value={medium.id}
              className={`${mpzFieldClassName()} read-only:bg-bg-2 font-mono text-xs text-fg-3`}
            />
          </div>

          <div>
            <label htmlFor={`edit-med-typ-${medium.id}`} className={mpzLabelClassName()}>
              Typ (read-only)
            </label>
            <input
              id={`edit-med-typ-${medium.id}`}
              type="text"
              readOnly
              value={medium.typ}
              className={`${mpzFieldClassName()} read-only:bg-bg-2 text-fg-3`}
            />
          </div>

          {quelleReadOnly ? (
            <>
              <div className="sm:col-span-2">
                <label htmlFor={`edit-med-untertitel-${medium.id}`} className={mpzLabelClassName()}>
                  Untertitel (optional)
                </label>
                <input
                  id={`edit-med-untertitel-${medium.id}`}
                  type="text"
                  value={form.untertitel}
                  onChange={(e) => updateField('untertitel', e.target.value)}
                  className={mpzFieldClassName()}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor={`edit-med-quelle-ro-${medium.id}`} className={mpzLabelClassName()}>
                  Quelle (read-only)
                </label>
                <input
                  id={`edit-med-quelle-ro-${medium.id}`}
                  type="text"
                  readOnly
                  value={medium.quelle}
                  className={`${mpzFieldClassName()} read-only:bg-bg-2 font-mono text-xs text-fg-3`}
                />
              </div>
            </>
          ) : (
            <div className="sm:col-span-2">
              <MediumLinkEmbedFields
                typ={medium.typ as 'link' | 'embed'}
                slug={slug}
                globalSuffixes={globalSuffixes}
                values={form}
                onChange={updateLinkEmbedField}
                idPrefix={`edit-med-${medium.id}`}
                thumbnailAssetUpload={thumbnailAssetUpload}
              />
            </div>
          )}

          {medium.typ === 'video' && (
            <>
              <div>
                <label htmlFor={`edit-med-video-source-${medium.id}`} className={mpzLabelClassName()}>
                  videoSource
                </label>
                <select
                  id={`edit-med-video-source-${medium.id}`}
                  value={form.videoSource}
                  onChange={(e) =>
                    updateField('videoSource', e.target.value as 'upload' | 'youtube')
                  }
                  className={mpzFieldClassName()}
                >
                  <option value="upload">upload</option>
                  <option value="youtube">youtube</option>
                </select>
              </div>
              <MediumAssetUploadField
                field="poster"
                slug={slug}
                value={form.poster}
                onPathChange={(path) => updateField('poster', path)}
                uploadDisabled={assetUploadDisabled}
                uploadDisabledHint={assetUploadDisabled ? UPLOAD_DIRTY_HINT : undefined}
                onPickFile={(file) => void handleAssetUpload('poster', file)}
                busy={assetUploadBusy}
                idPrefix={`edit-med-${medium.id}`}
                uploadError={posterUploadError}
              />
            </>
          )}

          {quelleReadOnly && (
            <MediumAssetUploadField
              field="thumbnail"
              slug={slug}
              value={form.thumbnail}
              onPathChange={(path) => updateField('thumbnail', path)}
              uploadDisabled={assetUploadDisabled}
              uploadDisabledHint={assetUploadDisabled ? UPLOAD_DIRTY_HINT : undefined}
              onPickFile={(file) => void handleAssetUpload('thumbnail', file)}
              busy={assetUploadBusy}
              idPrefix={`edit-med-${medium.id}`}
              uploadError={thumbnailUploadError}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className={mpzButtonClassName('primary')}
          >
            {isPending ? 'Speichert …' : 'Änderungen speichern'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className={mpzButtonClassName('secondary')}
          >
            Abbrechen
          </button>
        </div>

        {error && <MpzFormAlert variant="error">{error}</MpzFormAlert>}
      </form>

      {replaceAllowed && uploadRule && uploadTyp && (
        <section className="relative flex flex-col gap-4 overflow-hidden rounded-gs39-md border-2 border-accent/20 bg-bg-1 p-mpz-card-padding">
          <div className="absolute left-0 top-0 h-full w-1 bg-accent" aria-hidden />
          <p className="text-xs font-semibold uppercase tracking-wide text-fg-3">Datei ersetzen</p>
          <p className="text-sm text-fg-2">
            Medium-ID und Hotspot-Verknüpfungen bleiben erhalten. Der Dateipfad kann sich je nach
            Dateityp/Namenskollision ändern.
          </p>
          <div>
            <span className={mpzLabelClassName()}>Neue Datei</span>
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
              onDragOver={handleReplaceDragOver}
              onDrop={handleReplaceDrop}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-gs39-md border-2 border-dashed border-border-1 bg-bg-1 px-4 py-10 text-center transition-colors hover:border-accent hover:bg-accent/5"
            >
              <p className="text-sm text-fg-2">
                {selectedFile ? selectedFile.name : 'Datei hierher ziehen oder klicken'}
              </p>
              {selectedFile && (
                <p className="text-xs text-fg-3">
                  {(selectedFile.size / 1024).toFixed(0)} KB — andere Datei wählen
                </p>
              )}
            </div>
            <input
              ref={fileInputRef}
              id={`edit-med-file-${medium.id}`}
              type="file"
              accept={uploadRule.extensions.join(',')}
              disabled={busy}
              aria-label="Neue Datei"
              tabIndex={-1}
              onChange={handleReplaceFileInputChange}
              className="sr-only"
            />
          </div>
          <p className="text-xs text-fg-3">
            Erlaubt: {uploadRule.extensions.join(', ')} · max. {formatMaxBytes(uploadRule.maxBytes)}
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleFileReplace()}
            className={mpzButtonClassName('primary')}
          >
            {fileReplaceBusy ? 'Ersetzt …' : 'Datei ersetzen'}
          </button>
          {fileError && <MpzFormAlert variant="error">{fileError}</MpzFormAlert>}
        </section>
      )}

      {showSaveFirstHint && (
        <p className="text-sm text-fg-3">
          Erst speichern, dann kann die Datei ersetzt werden.
        </p>
      )}
    </div>
  )
}
