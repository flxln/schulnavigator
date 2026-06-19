'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import {
  defaultLinkEmbedFormValues,
  MediumLinkEmbedFields,
  type LinkEmbedFormValues,
} from '@/components/mpz-studio/medium-link-embed-fields'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import type { Medium } from '@/lib/types'

export type StationMediumEditFormProps = {
  slug: string
  medium: Medium
  globalSuffixes: readonly string[]
  onCancel: () => void
  onSuccess: (message: string) => void
}

function fieldClassName(): string {
  return 'w-full rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-fg-1'
}

function labelClassName(): string {
  return 'mb-1 block text-xs font-semibold text-fg-3'
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
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setForm(mediumToForm(medium, globalSuffixes))
    setError(null)
  }, [medium, globalSuffixes])

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateLinkEmbedField<K extends keyof LinkEmbedFormValues>(
    key: K,
    value: LinkEmbedFormValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
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

  const quelleReadOnly =
    medium.typ === 'audio' ||
    medium.typ === 'video' ||
    medium.typ === 'foto' ||
    medium.typ === 'text'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-t border-border-1 bg-bg-1 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-fg-3">Medium bearbeiten</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`edit-med-id-${medium.id}`} className={labelClassName()}>
            ID (read-only)
          </label>
          <input
            id={`edit-med-id-${medium.id}`}
            type="text"
            readOnly
            value={medium.id}
            className={`${fieldClassName()} bg-bg-2 text-fg-3`}
          />
        </div>

        <div>
          <label htmlFor={`edit-med-typ-${medium.id}`} className={labelClassName()}>
            Typ (read-only)
          </label>
          <input
            id={`edit-med-typ-${medium.id}`}
            type="text"
            readOnly
            value={medium.typ}
            className={`${fieldClassName()} bg-bg-2 text-fg-3`}
          />
        </div>

        {quelleReadOnly ? (
          <>
            <div className="sm:col-span-2">
              <label htmlFor={`edit-med-untertitel-${medium.id}`} className={labelClassName()}>
                Untertitel (optional)
              </label>
              <input
                id={`edit-med-untertitel-${medium.id}`}
                type="text"
                value={form.untertitel}
                onChange={(e) => updateField('untertitel', e.target.value)}
                className={fieldClassName()}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor={`edit-med-quelle-ro-${medium.id}`} className={labelClassName()}>
                Quelle (read-only)
              </label>
              <input
                id={`edit-med-quelle-ro-${medium.id}`}
                type="text"
                readOnly
                value={medium.quelle}
                className={`${fieldClassName()} bg-bg-2 font-mono text-xs text-fg-3`}
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
            />
          </div>
        )}

        {medium.typ === 'video' && (
          <>
            <div>
              <label htmlFor={`edit-med-video-source-${medium.id}`} className={labelClassName()}>
                videoSource
              </label>
              <select
                id={`edit-med-video-source-${medium.id}`}
                value={form.videoSource}
                onChange={(e) =>
                  updateField('videoSource', e.target.value as 'upload' | 'youtube')
                }
                className={fieldClassName()}
              >
                <option value="upload">upload</option>
                <option value="youtube">youtube</option>
              </select>
            </div>
            <div>
              <label htmlFor={`edit-med-poster-${medium.id}`} className={labelClassName()}>
                poster (optional)
              </label>
              <input
                id={`edit-med-poster-${medium.id}`}
                type="text"
                value={form.poster}
                onChange={(e) => updateField('poster', e.target.value)}
                placeholder="/media/…"
                className={`${fieldClassName()} font-mono text-xs`}
              />
              <p className="mt-1 text-xs text-fg-3">
                Pfad unter <code className="font-mono">/media/{slug}/</code> oder anderem
                öffentlichen Pfad.
              </p>
            </div>
          </>
        )}

        {quelleReadOnly && (
          <div className="sm:col-span-2">
            <label htmlFor={`edit-med-thumbnail-${medium.id}`} className={labelClassName()}>
              thumbnail (optional)
            </label>
            <input
              id={`edit-med-thumbnail-${medium.id}`}
              type="text"
              value={form.thumbnail}
              onChange={(e) => updateField('thumbnail', e.target.value)}
              placeholder="/media/…"
              className={`${fieldClassName()} font-mono text-xs`}
            />
            <p className="mt-1 text-xs text-fg-3">
              Pfad unter <code className="font-mono">/media/{slug}/</code> oder anderem öffentlichen
              Pfad.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-gs39-sm bg-accent px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {isPending ? 'Speichert …' : 'Änderungen speichern'}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={onCancel}
          className="rounded-gs39-sm border border-border-1 px-4 py-2 font-semibold text-fg-2 disabled:opacity-50"
        >
          Abbrechen
        </button>
      </div>

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
