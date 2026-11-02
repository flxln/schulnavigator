'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { mpzButtonClassName } from '@/components/mpz-studio/mpz-form-primitives'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import {
  dialogPlayUrl,
  useDialogSegmentAudioUpload,
} from '@/components/mpz-studio/use-dialog-segment-audio-upload'
import type { DialogSegmentAudit } from '@/lib/mpz-dialog-audio-ingest'

export type StationDialogSegmentAudioRowProps = {
  slug: string
  audit: DialogSegmentAudit
  disabled?: boolean
  onMutated: () => Promise<void>
}

export function StationDialogSegmentAudioRow({
  slug,
  audit,
  disabled = false,
  onMutated,
}: StationDialogSegmentAudioRowProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const { busy, error: rowError, setError: setRowError, upload } = useDialogSegmentAudioUpload()
  const [playError, setPlayError] = useState(false)

  const playUrl = audit.fileExists ? dialogPlayUrl(slug, audit.expectedClip) : null
  const uploadLabel = audit.fileExists
    ? `WAV ersetzen (${audit.expectedClip})`
    : 'WAV hochladen'

  async function afterMutation() {
    markMpzStudioDirty()
    await validateNow()
    await onMutated()
    router.refresh()
  }

  async function uploadSegment(file: File, overrideDrift: boolean) {
    setRowError(null)
    const ok = await upload(slug, audit.segmentIndex, file, {
      overrideQuelleDrift: overrideDrift,
    })
    if (!ok) {
      return
    }
    setPlayError(false)
    await afterMutation()
  }

  function handleUploadClick() {
    if (busy || disabled) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.wav,audio/wav'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      if (audit.state === 'drift') {
        const confirmed = window.confirm(
          `segment.quelle weicht ab (${audit.quelle}). Trotzdem auf ${audit.expectedClip} verknüpfen?`,
        )
        if (!confirmed) return
        void uploadSegment(file, true)
        return
      }
      void uploadSegment(file, false)
    }
    input.click()
  }

  async function handleClipRemove() {
    if (busy || disabled || !audit.fileExists) return
    if (
      !window.confirm(
        `Nur die WAV-Datei „${audit.expectedClip}" entfernen? Das Segment bleibt erhalten — Sprechertext und quelle in JSON bleiben.`,
      )
    ) {
      return
    }
    setRowError(null)
    try {
      const res = await fetch(
        `/api/mpz/dialog-audio/clip?slug=${encodeURIComponent(slug)}&segmentIndex=${audit.segmentIndex}`,
        { method: 'DELETE' },
      )
      const json = (await res.json()) as { message?: string }
      if (!res.ok) {
        setRowError(json.message ?? `Entfernen fehlgeschlagen (${res.status})`)
        return
      }
      setPlayError(false)
      await afterMutation()
    } catch {
      setRowError('Clip konnte nicht entfernt werden.')
    }
  }

  return (
    <div className="rounded-gs39-sm border border-border-1/60 bg-bg-1 px-4 py-3">
      <p className="mb-2 font-mono text-xs text-fg-3">
        Clip: <span className="text-fg-1">{audit.expectedClip}</span>
      </p>

      {playUrl ? (
        <div className="mb-3">
          <audio
            key={playUrl}
            controls
            preload="metadata"
            src={playUrl}
            className="h-8 max-w-full"
            onError={() => setPlayError(true)}
            onLoadedData={() => setPlayError(false)}
          />
          {playError && (
            <p className="mt-1 text-xs text-error">
              Vorschau nicht abspielbar — Zugangstoken fehlt? /eintritt scannen (oder
              SN_DEV_UNLOCK_ALL in Dev).
            </p>
          )}
        </div>
      ) : null}

      {rowError && (
        <p className="mb-2 text-xs text-error" role="alert">
          {rowError}
        </p>
      )}

      <button
        type="button"
        disabled={busy || disabled}
        onClick={handleUploadClick}
        className={`${mpzButtonClassName('primary')} mb-2 w-full !min-h-auto border-dashed py-3 text-xs`}
      >
        {uploadLabel}
      </button>
      <p className="mb-3 text-xs text-fg-3">Nur WAV, max. 15 MB.</p>

      {audit.fileExists ? (
        <button
          type="button"
          disabled={busy || disabled}
          onClick={() => void handleClipRemove()}
          className={`${mpzButtonClassName('secondary')} !min-h-9 text-xs`}
        >
          Clip entfernen
        </button>
      ) : null}
    </div>
  )
}
