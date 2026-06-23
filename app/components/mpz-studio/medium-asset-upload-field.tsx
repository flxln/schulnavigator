'use client'

import { MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import {
  mpzButtonClassName,
  mpzFieldClassName,
  mpzLabelClassName,
} from '@/components/mpz-studio/mpz-form-primitives'
import { useRef } from 'react'
import { UPLOAD_RULES } from '@/lib/mpz-upload-rules'
import type { MediumAssetField } from '@/lib/mpz-medium-asset-upload'

const KB = 1024
const MB = 1024 * KB
const FOTO_RULE = UPLOAD_RULES.foto

function formatMaxBytes(bytes: number): string {
  if (bytes >= MB) return `${Math.round(bytes / MB)} MB`
  return `${Math.round(bytes / KB)} KB`
}

export type MediumAssetUploadFieldProps = {
  field: MediumAssetField
  slug: string
  value: string
  onPathChange: (path: string) => void
  uploadDisabled: boolean
  uploadDisabledHint?: string
  onPickFile: (file: File) => void
  busy: boolean
  idPrefix: string
  uploadError?: string | null
}

export function MediumAssetUploadField({
  field,
  slug,
  value,
  onPathChange,
  uploadDisabled,
  uploadDisabledHint,
  onPickFile,
  busy,
  idPrefix,
  uploadError,
}: MediumAssetUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const label = field === 'poster' ? 'poster (optional)' : 'thumbnail (optional)'

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (!file) return
    onPickFile(file)
  }

  return (
    <div className="sm:col-span-2">
      <label htmlFor={`${idPrefix}-${field}`} className={mpzLabelClassName()}>
        {label}
      </label>
      <input
        id={`${idPrefix}-${field}`}
        type="text"
        value={value}
        onChange={(e) => onPathChange(e.target.value)}
        placeholder="/media/…"
        className={`${mpzFieldClassName()} font-mono text-xs`}
      />
      <p className="mt-1 text-xs text-fg-3">
        Pfad unter <code className="font-mono">/media/{slug}/</code> oder anderem öffentlichen
        Pfad.
      </p>

      <div className="mt-2 flex flex-col gap-2">
        <input
          ref={fileInputRef}
          id={`${idPrefix}-${field}-file`}
          type="file"
          accept={FOTO_RULE.extensions.join(',')}
          disabled={busy || uploadDisabled}
          onChange={handleFileChange}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
        />
        <button
          type="button"
          disabled={busy || uploadDisabled}
          onClick={() => fileInputRef.current?.click()}
          className={mpzButtonClassName('secondary')}
        >
          {busy ? 'Lädt hoch …' : 'Bild hochladen'}
        </button>
        <p className="text-xs text-fg-3">
          Erlaubt: {FOTO_RULE.extensions.join(', ')} · max. {formatMaxBytes(FOTO_RULE.maxBytes)}
        </p>
        {uploadDisabled && uploadDisabledHint && (
          <p className="text-xs text-fg-3">{uploadDisabledHint}</p>
        )}
        {uploadError && <MpzFormAlert variant="error">{uploadError}</MpzFormAlert>}
      </div>
    </div>
  )
}

export { FOTO_RULE, formatMaxBytes }
