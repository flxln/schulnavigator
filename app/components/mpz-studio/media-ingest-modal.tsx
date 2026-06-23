'use client'

import { useEffect, useState } from 'react'
import { MediaIngestForm } from '@/components/mpz-studio/media-ingest-form'
import { MediaLinkEmbedForm } from '@/components/mpz-studio/media-link-embed-form'
import { MpzModal } from '@/components/mpz-studio/mpz-modal'
import { mpzFieldClassName } from '@/components/mpz-studio/mpz-form-primitives'
import { MPZ_HUB_SLUGS } from '@/lib/schoolhouse-hub-map'
import type { MediumTyp } from '@/lib/types'

const ALL_TYPEN: { value: MediumTyp; label: string }[] = [
  { value: 'audio', label: 'Audio (.mp3 .wav .m4a)' },
  { value: 'video', label: 'Video (.mp4)' },
  { value: 'foto', label: 'Foto (.jpg .jpeg .webp)' },
  { value: 'text', label: 'Text (.md .txt)' },
  { value: 'link', label: 'Link (externe https-URL)' },
  { value: 'embed', label: 'Embed (Delightex / Book Creator)' },
]

const FILE_TYPEN = new Set<MediumTyp>(['audio', 'video', 'foto', 'text'])

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

  useEffect(() => {
    if (open) {
      setSelectedSlug(defaultSlug)
      setSelectedTyp(initialTyp ?? 'audio')
    }
  }, [open, defaultSlug, initialTyp])

  const isFileTyp = FILE_TYPEN.has(selectedTyp)

  return (
    <MpzModal
      open={open}
      title="Medien hinzufügen"
      titleId="media-ingest-modal-title"
      onClose={onClose}
    >
      {!slug && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-fg-2">Station (slug)</span>
          <select
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
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-fg-2">Typ</span>
        <select
          value={selectedTyp}
          onChange={(e) => setSelectedTyp(e.target.value as MediumTyp)}
          className={mpzFieldClassName()}
        >
          {ALL_TYPEN.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      {isFileTyp ? (
        <MediaIngestForm
          key={`${selectedSlug}-${selectedTyp}`}
          initialSlug={selectedSlug}
          fixedTyp={selectedTyp}
          hideSlugSelect
          hideTypSelect
          onSuccess={() => onClose()}
        />
      ) : (
        <MediaLinkEmbedForm
          key={`${selectedSlug}-${selectedTyp}`}
          slug={selectedSlug}
          typ={selectedTyp as 'link' | 'embed'}
          globalSuffixes={globalSuffixes}
          onSuccess={() => onClose()}
        />
      )}
    </MpzModal>
  )
}
