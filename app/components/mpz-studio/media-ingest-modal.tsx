'use client'

import { useEffect, useRef, useState } from 'react'
import { MediaIngestForm } from '@/components/mpz-studio/media-ingest-form'
import { MediaLinkEmbedForm } from '@/components/mpz-studio/media-link-embed-form'
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
  onClose: () => void
}

function fieldClassName(): string {
  return 'w-full rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-fg-1'
}

export function MediaIngestModal({ open, slug, initialTyp, onClose }: MediaIngestModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
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

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  const isFileTyp = FILE_TYPEN.has(selectedTyp)

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto max-h-[90vh] w-[min(100%,42rem)] overflow-y-auto rounded-gs39-md border border-border-1 bg-bg-2 p-0 shadow-gs39-lg backdrop:bg-black/40"
      aria-labelledby="media-ingest-modal-title"
      onClose={onClose}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-1 bg-bg-2 px-5 py-4">
        <h2 id="media-ingest-modal-title" className="text-lg font-bold text-fg-1">
          Medien hinzufügen
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-gs39-sm px-2 py-1 text-sm font-semibold text-fg-3 hover:bg-bg-1 hover:text-fg-1"
          aria-label="Schließen"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-4 p-5">
        {!slug && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-fg-2">Station (slug)</span>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className={fieldClassName()}
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
            className={fieldClassName()}
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
            onSuccess={() => onClose()}
          />
        )}
      </div>
    </dialog>
  )
}
