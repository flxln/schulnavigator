'use client'

import { MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import {
  mpzButtonClassName,
  mpzFieldClassName,
  mpzLabelClassName,
} from '@/components/mpz-studio/mpz-form-primitives'
import {
  dialogPlayUrl,
  uploadDialogClip,
} from '@/components/mpz-studio/use-dialog-segment-audio-upload'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useTransition } from 'react'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import { buildClipName } from '@/lib/dialog-audio-naming'
import { segmentHasAudio } from '@/lib/dialog-display'
import type { DialogSegmentAudit } from '@/lib/mpz-dialog-audio-ingest'
import type {
  DialogBubbleTail,
  DialogGruppe,
  DialogRolle,
  DialogSegment,
  Station,
} from '@/lib/types'

export type StationDialogSegmentFormProps = {
  slug: string
  mode: 'add' | 'edit'
  segment?: DialogSegment
  segmentIndex: number | null
  segmentCount: number
  audit?: DialogSegmentAudit | null
  gruppen: DialogGruppe[]
  onCancel: () => void
  onSuccess: (message: string) => void
  onRefresh: () => Promise<void>
}

const ROLLEN: DialogRolle[] = ['frieda', 'otto', 'beide']
const TAILS: DialogBubbleTail[] = ['left', 'right', 'center']

type SegmentSaveResponse = {
  station?: Station
  message?: string
}

function resolveSegmentIndexAfterAdd(
  savedStation: Station,
  requestedId: string,
): number {
  const segments = savedStation.dialog?.segmente ?? []
  const targetId = requestedId.trim() || segments.at(-1)?.id
  if (!targetId) {
    return Math.max(0, segments.length - 1)
  }
  const idx = segments.findIndex((s) => s.id === targetId)
  return idx >= 0 ? idx : Math.max(0, segments.length - 1)
}

export function StationDialogSegmentForm({
  slug,
  mode,
  segment,
  segmentIndex,
  segmentCount,
  audit,
  gruppen,
  onCancel,
  onSuccess,
  onRefresh,
}: StationDialogSegmentFormProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const [id, setId] = useState(segment?.id ?? '')
  const [rolle, setRolle] = useState<DialogRolle>(segment?.rolle ?? 'frieda')
  const [text, setText] = useState(segment?.text ?? '')
  const [gruppe, setGruppe] = useState(segment?.gruppe ?? '')
  const [tail, setTail] = useState(segment?.tail ?? '')
  const [hasAudio, setHasAudio] = useState(
    segment ? segmentHasAudio(segment) : false,
  )
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [uploadRetryIndex, setUploadRetryIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [playError, setPlayError] = useState(false)
  const [isPending, startTransition] = useTransition()

  const previewIndex =
    uploadRetryIndex ??
    (mode === 'add' ? segmentCount : (segmentIndex ?? 0))

  const expectedClip = useMemo(() => {
    if (!hasAudio) return null
    return buildClipName(previewIndex, rolle)
  }, [hasAudio, previewIndex, rolle])

  const existingPlayUrl =
    hasAudio && audit?.fileExists && expectedClip
      ? dialogPlayUrl(slug, audit.expectedClip)
      : null

  useEffect(() => {
    if (segment) {
      setId(segment.id)
      setRolle(segment.rolle)
      setText(segment.text)
      setGruppe(segment.gruppe ?? '')
      setTail(segment.tail ?? '')
      setHasAudio(segmentHasAudio(segment))
      setPendingFile(null)
      setUploadRetryIndex(null)
      setUploadError(null)
      setPlayError(false)
    }
  }, [segment])

  function handleAudioToggle(checked: boolean) {
    setHasAudio(checked)
    if (!checked) {
      setPendingFile(null)
      setUploadRetryIndex(null)
      setUploadError(null)
    }
  }

  function handleFilePick() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.wav,audio/wav'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      setPendingFile(file)
      setUploadError(null)
    }
    input.click()
  }

  async function runIngest(
    index: number,
    file: File,
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    const result = await uploadDialogClip(slug, index, file)
    if (!result.ok) {
      return result
    }
    markMpzStudioDirty()
    await validateNow()
    await onRefresh()
    router.refresh()
    return { ok: true }
  }

  async function saveSegment(): Promise<
    { ok: true; index: number } | { ok: false; message: string }
  > {
    if (mode === 'add') {
      const body: Record<string, unknown> = { rolle, text, hasAudio }
      if (id.trim()) body.id = id.trim()
      if (gruppe) body.gruppe = gruppe
      if (tail) body.tail = tail
      const res = await fetch(
        `/api/mpz/stations/${encodeURIComponent(slug)}/dialog/segmente`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        },
      )
      const json = (await res.json()) as SegmentSaveResponse
      if (!res.ok || !json.station) {
        return {
          ok: false,
          message: json.message ?? `Fehler (${res.status})`,
        }
      }
      return {
        ok: true,
        index: resolveSegmentIndexAfterAdd(json.station, id),
      }
    }

    const body: Record<string, unknown> = { text, rolle, hasAudio }
    body.gruppe = gruppe || null
    body.tail = tail || null
    const res = await fetch(
      `/api/mpz/stations/${encodeURIComponent(slug)}/dialog/segmente/${encodeURIComponent(segment!.id)}`,
      {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      },
    )
    const json = (await res.json()) as SegmentSaveResponse
    if (!res.ok) {
      return {
        ok: false,
        message: json.message ?? `Fehler (${res.status})`,
      }
    }
    const resolvedIndex =
      json.station?.dialog?.segmente.findIndex((s) => s.id === segment!.id) ??
      segmentIndex ??
      0
    return { ok: true, index: resolvedIndex >= 0 ? resolvedIndex : (segmentIndex ?? 0) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setUploadError(null)

    startTransition(async () => {
      try {
        const saveResult = await saveSegment()
        if (!saveResult.ok) {
          setError(saveResult.message)
          return
        }

        markMpzStudioDirty()
        await validateNow()

        if (hasAudio && pendingFile) {
          const ingestResult = await runIngest(saveResult.index, pendingFile)
          if (!ingestResult.ok) {
            setUploadRetryIndex(saveResult.index)
            setUploadError(
              `Segment gespeichert, aber Upload fehlgeschlagen: ${ingestResult.message}`,
            )
            return
          }
          setPendingFile(null)
          setUploadRetryIndex(null)
          onSuccess(
            mode === 'add'
              ? 'Segment angelegt und WAV hochgeladen.'
              : 'Segment gespeichert und WAV hochgeladen.',
          )
          return
        }

        await onRefresh()
        router.refresh()
        onSuccess(mode === 'add' ? 'Segment angelegt.' : 'Segment gespeichert.')
      } catch {
        setError('Speichern fehlgeschlagen.')
      }
    })
  }

  async function handleUploadRetry() {
    if (!pendingFile || uploadRetryIndex === null) return
    setUploadError(null)
    startTransition(async () => {
      const ingestResult = await runIngest(uploadRetryIndex, pendingFile)
      if (!ingestResult.ok) {
        setUploadError(ingestResult.message)
        return
      }
      setPendingFile(null)
      setUploadRetryIndex(null)
      onSuccess('WAV hochgeladen.')
    })
  }

  const filePickLabel = pendingFile
    ? `Ausgewählt: ${pendingFile.name}`
    : audit?.fileExists
      ? `WAV ersetzen (${expectedClip})`
      : 'WAV auswählen'

  return (
    <form onSubmit={handleSubmit} className="rounded-gs39-sm border border-border-1 bg-bg-1 p-4">
      {mode === 'add' && (
        <div className="mb-3">
          <label className={mpzLabelClassName()} htmlFor="segment-id">
            ID (optional, Auto wenn leer)
          </label>
          <input
            id="segment-id"
            className={mpzFieldClassName()}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="d10"
          />
        </div>
      )}
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={mpzLabelClassName()} htmlFor="segment-rolle">
            Rolle
          </label>
          <select
            id="segment-rolle"
            className={mpzFieldClassName()}
            value={rolle}
            onChange={(e) => setRolle(e.target.value as DialogRolle)}
          >
            {ROLLEN.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={mpzLabelClassName()} htmlFor="segment-gruppe">
            Gruppe
          </label>
          <select
            id="segment-gruppe"
            className={mpzFieldClassName()}
            value={gruppe}
            onChange={(e) => setGruppe(e.target.value)}
          >
            <option value="">— keine —</option>
            {gruppen.map((g) => (
              <option key={g.id} value={g.id}>
                {g.id}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-3">
        <label className={mpzLabelClassName()} htmlFor="segment-tail">
          tail
        </label>
        <select
          id="segment-tail"
          className={mpzFieldClassName()}
          value={tail}
          onChange={(e) => setTail(e.target.value)}
        >
          <option value="">— Standard —</option>
          {TAILS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-fg-1">
          <input
            type="checkbox"
            checked={hasAudio}
            onChange={(e) => handleAudioToggle(e.target.checked)}
            className="size-4 rounded border-border-1"
          />
          Mit Audio (WAV-Clip)
        </label>
        <p className="mt-1 text-xs text-fg-3">
          Mit Häkchen: WAV hier auswählen und mit Speichern hochladen. Ohne Häkchen: nur
          Sprechblase, Tippen zum Weiter.
        </p>
      </div>

      {hasAudio && expectedClip ? (
        <div className="mb-3 rounded-gs39-sm border border-border-1/60 bg-bg-2 px-4 py-3">
          <p className="mb-2 text-xs font-semibold text-fg-1">Audio</p>
          <p className="mb-3 font-mono text-xs text-fg-3">
            Zielname: <span className="text-fg-1">{expectedClip}</span>
          </p>

          {existingPlayUrl && !pendingFile ? (
            <div className="mb-3">
              <audio
                key={existingPlayUrl}
                controls
                preload="metadata"
                src={existingPlayUrl}
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

          <button
            type="button"
            disabled={isPending}
            onClick={handleFilePick}
            className={`${mpzButtonClassName('primary')} mb-2 w-full !min-h-auto border-dashed py-3 text-xs`}
          >
            {filePickLabel}
          </button>
          <p className="text-xs text-fg-3">Nur WAV, max. 15 MB.</p>
        </div>
      ) : null}

      <div className="mb-3">
        <label className={mpzLabelClassName()} htmlFor="segment-text">
          Text
        </label>
        <textarea
          id="segment-text"
          className={`${mpzFieldClassName()} min-h-[5rem]`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {error && <MpzFormAlert variant="error">{error}</MpzFormAlert>}
      {uploadError && (
        <div className="mb-3">
          <MpzFormAlert variant="error">{uploadError}</MpzFormAlert>
          {uploadRetryIndex !== null && pendingFile ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => void handleUploadRetry()}
              className={`${mpzButtonClassName('secondary')} mt-2 !min-h-9 px-3 py-1.5 text-sm`}
            >
              Upload erneut versuchen
            </button>
          ) : null}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className={`${mpzButtonClassName('primary')} !min-h-9 px-3 py-1.5 text-sm`}
        >
          Speichern
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`${mpzButtonClassName('secondary')} !min-h-9 px-3 py-1.5 text-sm`}
        >
          Abbrechen
        </button>
      </div>
    </form>
  )
}
