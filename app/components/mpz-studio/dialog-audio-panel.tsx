'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import type { DialogSegmentAudit } from '@/lib/mpz-dialog-audio-ingest'
import type { MpzValidationReport } from '@/lib/mpz-studio-overview'
import { useStudioValidation } from '@/components/mpz-studio/studio-validation-context'

const DIALOG_SLUGS = ['daz', 'pc-raum'] as const

interface StatusResponse {
  slug: string
  segments: DialogSegmentAudit[]
  orphans: string[]
  missingCount: number
  driftCount: number
}

const STATE_LABEL: Record<DialogSegmentAudit['state'], string> = {
  ok: 'ok',
  leer: 'leer',
  drift: 'Drift',
  fehlt: 'fehlt',
}

const STATE_CLASS: Record<DialogSegmentAudit['state'], string> = {
  ok: 'bg-brand-green/15 text-fg-1',
  leer: 'bg-bg-3 text-fg-2',
  drift: 'bg-brand-sun/20 text-fg-1',
  fehlt: 'bg-brand-red/15 text-fg-1',
}

export function DialogAudioPanel() {
  const { applyReport } = useStudioValidation()
  const [slug, setSlug] = useState<string>('daz')
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [rowError, setRowError] = useState<string | null>(null)

  const loadStatus = useCallback(async (targetSlug: string) => {
    setLoadError(null)
    try {
      const res = await fetch(
        `/api/mpz/dialog-audio/status?slug=${encodeURIComponent(targetSlug)}`,
      )
      const json = (await res.json()) as StatusResponse & { message?: string }
      if (!res.ok) {
        setStatus(null)
        setLoadError(json.message ?? `Fehler (${res.status})`)
        return
      }
      setStatus(json)
    } catch {
      setLoadError('Status konnte nicht geladen werden.')
      setStatus(null)
    }
  }, [])

  useEffect(() => {
    void loadStatus(slug)
  }, [slug, loadStatus])

  async function uploadSegment(
    segmentIndex: number,
    file: File,
    overrideDrift: boolean,
  ) {
    setRowError(null)
    setBusy(true)
    const form = new FormData()
    form.set('slug', slug)
    form.set('segmentIndex', String(segmentIndex))
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
      const json = (await res.json()) as {
        message?: string
        mtime?: string | null
        validation?: MpzValidationReport | null
      }
      if (!res.ok) {
        setRowError(json.message ?? `Upload fehlgeschlagen (${res.status})`)
        return
      }
      await loadStatus(slug)
      if (json.validation) {
        applyReport(json.validation, json.mtime ?? json.validation.stationsModifiedAt)
      }
    } catch {
      setRowError('Upload fehlgeschlagen.')
    } finally {
      setBusy(false)
    }
  }

  function handleUploadClick(seg: DialogSegmentAudit) {
    if (busy) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.wav,audio/wav'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      if (seg.state === 'drift') {
        const ok = window.confirm(
          `segment.quelle weicht ab (${seg.quelle}). Trotzdem auf ${seg.expectedClip} verknüpfen?`,
        )
        if (!ok) return
        void uploadSegment(seg.segmentIndex, file, true)
        return
      }
      void uploadSegment(seg.segmentIndex, file, false)
    }
    input.click()
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="dialog-slug" className="text-sm font-semibold text-fg-1">
          Station
        </label>
        <select
          id="dialog-slug"
          value={slug}
          disabled={busy}
          onChange={(e) => setSlug(e.target.value)}
          className="rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-sm text-fg-1"
        >
          {DIALOG_SLUGS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loadError && (
        <p className="rounded-gs39-sm border border-brand-red/30 bg-brand-red/10 px-3 py-2 text-sm text-fg-1">
          {loadError}
        </p>
      )}

      {status && (
        <>
          {status.missingCount > 0 && (
            <p className="rounded-gs39-sm border border-brand-red/30 bg-brand-red/10 px-3 py-2 text-sm text-fg-1">
              {status.missingCount} Segment(e) ohne WAV-Datei.
            </p>
          )}
          {status.driftCount > 0 && (
            <p className="rounded-gs39-sm border border-brand-sun/40 bg-brand-sun/10 px-3 py-2 text-sm text-fg-1">
              {status.driftCount} Segment(e) mit abweichender quelle (Drift).
            </p>
          )}
          {status.orphans.length > 0 && (
            <p className="rounded-gs39-sm border border-brand-sun/40 bg-brand-sun/10 px-3 py-2 text-sm text-fg-1">
              Verwaiste WAVs: {status.orphans.join(', ')}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border-1 text-fg-3">
                  <th className="py-2 pr-2 font-semibold">Nr</th>
                  <th className="py-2 pr-2 font-semibold">Rolle</th>
                  <th className="py-2 pr-2 font-semibold">Text</th>
                  <th className="py-2 pr-2 font-semibold">Clip</th>
                  <th className="py-2 pr-2 font-semibold">Status</th>
                  <th className="py-2 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {status.segments.map((seg) => (
                  <tr key={seg.segmentId} className="border-b border-border-1/60">
                    <td className="py-2 pr-2 font-mono text-fg-2">
                      {String(seg.segmentIndex + 1).padStart(2, '0')}
                    </td>
                    <td className="py-2 pr-2 capitalize text-fg-1">{seg.rolle}</td>
                    <td className="max-w-[12rem] truncate py-2 pr-2 text-fg-2" title={seg.textPreview}>
                      {seg.textPreview}
                    </td>
                    <td className="py-2 pr-2 font-mono text-xs text-fg-2">{seg.expectedClip}</td>
                    <td className="py-2 pr-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATE_CLASS[seg.state]}`}
                      >
                        {STATE_LABEL[seg.state]}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleUploadClick(seg)}
                        className="rounded-gs39-sm bg-accent px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        WAV
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-fg-2">
            Vorschau:{' '}
            <Link
              href={`/raum/${slug}`}
              className="font-semibold text-accent underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              /raum/{slug}
            </Link>
          </p>
        </>
      )}

      {rowError && (
        <p className="text-sm text-brand-red">{rowError}</p>
      )}
    </div>
  )
}
