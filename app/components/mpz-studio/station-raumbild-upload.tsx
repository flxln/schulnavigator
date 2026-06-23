'use client'

import { MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import { mpzButtonClassName, mpzLabelClassName } from '@/components/mpz-studio/mpz-form-primitives'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import type { RaumbildUploadResponse, RaumbildVariant } from '@/lib/mpz-station-raumbild-ingest'
import type { Station, ViewerMode } from '@/lib/types'

/** Werte spiegeln mpz-station-raumbild-ingest.ts — nicht dort importieren (node:fs). */
const FLAT_MAX_BYTES = 500 * 1024
const PANO360_MAX_BYTES = 4 * 1024 * 1024
const FLAT_UPLOAD_RATIO_MIN = 2.5
const PANO360_RATIO = 2

export type StationRaumbildUploadProps = {
  slug: string
  station: Station
  viewer: ViewerMode
  onStationUpdated?: (station: Station) => void
}

const KB = 1024
const MB = 1024 * KB

function formatMaxBytes(bytes: number): string {
  if (bytes >= MB) return `${Math.round(bytes / MB)} MB`
  return `${Math.round(bytes / KB)} KB`
}

type RaumbildZoneProps = {
  variant: RaumbildVariant
  title: string
  path: string | null
  accept: string
  hint: string
  busy: boolean
  onPickFile: (file: File) => void
}

function RaumbildZone({
  variant,
  title,
  path,
  accept,
  hint,
  busy,
  onPickFile,
}: RaumbildZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadLabel = variant === 'flat' ? 'Flat hochladen' : '360° hochladen'
  const previewAlt = variant === 'flat' ? 'Flat-Raumbild Vorschau' : '360°-Panorama Vorschau'

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (!file || busy) return
    onPickFile(file)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className={mpzLabelClassName()}>{title}</span>
        <span className="font-mono text-xs text-fg-2">{path ?? '—'}</span>
      </div>

      <div className="flex flex-col gap-3 rounded-gs39-md border-2 border-dashed border-border-1 p-3">
        <div className="relative aspect-[2/1] w-full overflow-hidden rounded-gs39-sm border border-border-1 bg-bg-1">
          {path ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={path} alt={previewAlt} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-fg-3">
              Noch kein Bild
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={busy}
          onChange={handleFileChange}
          tabIndex={-1}
          aria-hidden
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
          className={mpzButtonClassName('secondary')}
        >
          {busy ? 'Lädt …' : uploadLabel}
        </button>
        <p className="text-xs text-fg-3">{hint}</p>
      </div>
    </div>
  )
}

export function StationRaumbildUpload({
  slug,
  station,
  viewer,
  onStationUpdated,
}: StationRaumbildUploadProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busyVariant, setBusyVariant] = useState<RaumbildVariant | null>(null)

  const bildPath = station.bild ?? null
  const panoPath = station.panorama360 ?? null
  const showPano360 = viewer === 'equirectangular'
  const zonesLayout = showPano360
    ? 'grid gap-4 sm:grid-cols-2'
    : 'flex flex-col gap-4'

  async function uploadFile(
    file: File,
    variant: RaumbildVariant,
    collision: 'reject' | 'replace',
  ) {
    setUploadError(null)
    setSuccess(null)
    setBusyVariant(variant)
    const form = new FormData()
    form.set('file', file)
    form.set('variant', variant)
    form.set('collision', collision)
    try {
      const res = await fetch(
        `/api/mpz/stations/${encodeURIComponent(slug)}/raumbild`,
        { method: 'POST', body: form },
      )
      const json = (await res.json()) as RaumbildUploadResponse & {
        message?: string
        error?: string
      }

      if (res.status === 409 && collision === 'reject') {
        const label = variant === 'flat' ? 'Flat-Raumbild' : '360°-Panorama'
        const ok = window.confirm(
          `${label} für diese Station existiert bereits. Überschreiben?`,
        )
        if (ok) {
          await uploadFile(file, variant, 'replace')
        }
        return
      }

      if (!res.ok) {
        setUploadError(json.message ?? `Upload fehlgeschlagen (${res.status})`)
        return
      }

      onStationUpdated?.(json.station)
      const label = variant === 'flat' ? 'Flat-Raumbild' : '360°-Panorama'
      setSuccess(`${label} gespeichert: ${json.path}`)
      markMpzStudioDirty()
      await validateNow()
      router.refresh()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload fehlgeschlagen.')
    } finally {
      setBusyVariant(null)
    }
  }

  function handlePickFile(variant: RaumbildVariant) {
    return (file: File) => {
      if (busyVariant) return
      void uploadFile(file, variant, 'reject')
    }
  }

  const busy = busyVariant !== null

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-fg-1">Raumbilder</h3>

      {/*
        Authoring-UX: 360°-Zone nur bei equirectangular sichtbar.
        POST /raumbild akzeptiert variant=pano360 unabhängig vom Viewer;
        vorhandenes panorama360 bleibt beim Wechsel auf flat im JSON.
      */}
      <div className={zonesLayout} data-testid="raumbild-zones">
        <RaumbildZone
          variant="flat"
          title="Flat-Panorama"
          path={bildPath}
          accept=".jpg,.jpeg,image/jpeg"
          hint={`JPEG · max. ${formatMaxBytes(FLAT_MAX_BYTES)} · Seitenverhältnis min. ${FLAT_UPLOAD_RATIO_MIN}:1`}
          busy={busyVariant === 'flat'}
          onPickFile={handlePickFile('flat')}
        />

        {showPano360 && (
          <RaumbildZone
            variant="pano360"
            title="Panorama 360°"
            path={panoPath}
            accept=".jpg,.jpeg,.webp,image/jpeg,image/webp"
            hint={`JPEG oder WebP · max. ${formatMaxBytes(PANO360_MAX_BYTES)} · Seitenverhältnis ${PANO360_RATIO}:1`}
            busy={busyVariant === 'pano360'}
            onPickFile={handlePickFile('pano360')}
          />
        )}
      </div>

      {uploadError && <MpzFormAlert variant="error">{uploadError}</MpzFormAlert>}

      {success && <MpzFormAlert variant="success">{success}</MpzFormAlert>}
    </div>
  )
}
