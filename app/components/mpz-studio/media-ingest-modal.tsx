'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  MediaIngestForm,
  type MediaFormState,
} from '@/components/mpz-studio/media-ingest-form'
import { MediaLinkEmbedForm } from '@/components/mpz-studio/media-link-embed-form'
import { MpzModal } from '@/components/mpz-studio/mpz-modal'
import {
  mpzButtonClassName,
  mpzFieldClassName,
  mpzLabelClassName,
} from '@/components/mpz-studio/mpz-form-primitives'
import { MPZ_HUB_SLUGS } from '@/lib/schoolhouse-hub-map'
import type { MediumTyp } from '@/lib/types'

const MEDIA_INGEST_FORM_ID = 'media-ingest-active-form'

const ALL_TYPEN: { value: MediumTyp; label: string }[] = [
  { value: 'audio', label: 'audio' },
  { value: 'video', label: 'video' },
  { value: 'foto', label: 'foto' },
  { value: 'text', label: 'text' },
  { value: 'link', label: 'link' },
  { value: 'embed', label: 'embed' },
]

const FILE_TYPEN = new Set<MediumTyp>(['audio', 'video', 'foto', 'text'])

const INITIAL_FORM_STATE: MediaFormState = { canSubmit: false, busy: false }

export type MediaIngestModalProps = {
  open: boolean
  slug?: string
  initialTyp?: MediumTyp
  globalSuffixes: readonly string[]
  onClose: () => void
}

export function MediaIngestModal({
  open,
  slug,
  initialTyp,
  globalSuffixes,
  onClose,
}: MediaIngestModalProps) {
  const defaultSlug: string =
    slug && MPZ_HUB_SLUGS.includes(slug as (typeof MPZ_HUB_SLUGS)[number])
      ? slug
      : (MPZ_HUB_SLUGS[0] ?? 'klassenzimmer')

  const [selectedSlug, setSelectedSlug] = useState(defaultSlug)
  const [selectedTyp, setSelectedTyp] = useState<MediumTyp>(initialTyp ?? 'audio')
  const [formState, setFormState] = useState<MediaFormState>(INITIAL_FORM_STATE)

  const handleStateChange = useCallback((state: MediaFormState) => {
    setFormState(state)
  }, [])

  useEffect(() => {
    if (open) {
      setSelectedSlug(defaultSlug)
      setSelectedTyp(initialTyp ?? 'audio')
      setFormState(INITIAL_FORM_STATE)
    }
  }, [open, defaultSlug, initialTyp])

  useEffect(() => {
    setFormState(INITIAL_FORM_STATE)
  }, [selectedTyp])

  const isFileTyp = FILE_TYPEN.has(selectedTyp)

  return (
    <MpzModal
      open={open}
      title="Medium hinzufügen"
      titleId="media-ingest-modal-title"
      className="w-[min(100%,35rem)]"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={mpzButtonClassName('secondary')}
          >
            Abbrechen
          </button>
          <button
            type="submit"
            form={MEDIA_INGEST_FORM_ID}
            disabled={!formState.canSubmit || formState.busy}
            className={mpzButtonClassName('primary')}
          >
            {formState.busy ? 'Speichert …' : 'Hinzufügen'}
          </button>
        </div>
      }
    >
      {!slug && (
        <div>
          <label htmlFor="media-ingest-modal-slug" className={mpzLabelClassName()}>
            Station (slug)
          </label>
          <select
            id="media-ingest-modal-slug"
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
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

      <div>
        <span className={`${mpzLabelClassName()} uppercase tracking-[0.05em]`}>
          Medientyp wählen
        </span>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {ALL_TYPEN.map((t) => {
            const selected = selectedTyp === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setSelectedTyp(t.value)}
                className={`flex min-h-11 flex-col items-center justify-center rounded-gs39-sm border px-3 py-4 text-sm transition-colors ${
                  selected
                    ? 'border-accent bg-accent/10 font-semibold text-accent'
                    : 'border-border-1 text-fg-1 hover:bg-bg-2'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {isFileTyp ? (
        <MediaIngestForm
          key={`${selectedSlug}-${selectedTyp}`}
          formId={MEDIA_INGEST_FORM_ID}
          hideSubmit
          initialSlug={selectedSlug}
          fixedTyp={selectedTyp}
          hideSlugSelect
          hideTypSelect
          onStateChange={handleStateChange}
          onSuccess={() => onClose()}
        />
      ) : (
        <MediaLinkEmbedForm
          key={`${selectedSlug}-${selectedTyp}`}
          formId={MEDIA_INGEST_FORM_ID}
          hideSubmit
          slug={selectedSlug}
          typ={selectedTyp as 'link' | 'embed'}
          globalSuffixes={globalSuffixes}
          onStateChange={handleStateChange}
          onSuccess={() => onClose()}
        />
      )}
    </MpzModal>
  )
}
