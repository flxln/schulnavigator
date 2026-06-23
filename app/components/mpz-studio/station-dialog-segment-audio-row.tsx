'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import type { DialogSegmentAudit } from '@/lib/mpz-dialog-audio-ingest'

function dialogPlayUrl(slug: string, expectedClip: string): string {
  return `/api/dialog/${slug}/${expectedClip}`
}

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
  const [busy, setBusy] = useState(false)
  const [rowError, setRowError] = useState<string | null>(null)
  const [playError, setPlayError] = useState(false)

  const playUrl = audit.fileExists ? dialogPlayUrl(slug, audit.expectedClip) : null

  async function afterMutation() {
    markMpzStudioDirty()
    await validateNow()
    await onMutated()
    router.refresh()
  }

  async function uploadSegment(file: File, overrideDrift: boolean) {
    setRowError(null)
    setBusy(true)
    const form = new FormData()
    form.set('slug', slug)
    form.set('segmentIndex', String(audit.segmentIndex))
    form.set('file', file)
    form.set('collision', 'replace')
    if (overrideDrift) {
      form.set('overrideQuelleDrift', 'true')
    }
    try {
      const res = await fetch('/api/mpz/dialog-audio/ingest', {
        method: 'POST',
        body: form,
      })
      const json = (await res.json()) as { message?: string }
      if (!res.ok) {
        setRowError(json.message ?? `Upload fehlgeschlagen (${res.status})`)
        return
      }
      setPlayError(false)
      await afterMutation()
    } catch {
      setRowError('Upload fehlgeschlagen.')
    } finally {
      setBusy(false)
    }
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
        const ok = window.confirm(
          `segment.quelle weicht ab (${audit.quelle}). Trotzdem auf ${audit.expectedClip} verknüpfen?`,
        )
        if (!ok) return
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
    setBusy(true)
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
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-gs39-sm border border-border-1/60 bg-bg-2 px-4 py-3">
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
            <p className="mt-1 text-xs text-brand-red">
              Vorschau nicht abspielbar — Zugangstoken fehlt? /eintritt scannen (oder
              SN_DEV_UNLOCK_ALL in Dev).
            </p>
          )}
        </div>
      ) : null}

      {rowError && (
        <p className="mb-2 text-xs text-brand-red" role="alert">
          {rowError}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || disabled}
          onClick={handleUploadClick}
          className="rounded-gs39-sm bg-accent px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {audit.fileExists ? 'WAV ersetzen' : 'WAV hochladen'}
        </button>
        {audit.fileExists ? (
          <button
            type="button"
            disabled={busy || disabled}
            onClick={() => void handleClipRemove()}
            className="rounded-gs39-sm border border-border-1 px-3 py-1.5 text-xs font-semibold text-fg-2 disabled:opacity-50"
          >
            Clip entfernen
          </button>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-fg-3">Nur WAV, max. 15 MB.</p>
    </div>
  )
}
