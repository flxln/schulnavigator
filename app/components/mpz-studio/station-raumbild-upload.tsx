'use client'

import { MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import type { RaumbildUploadResponse, RaumbildVariant } from '@/lib/mpz-station-raumbild-ingest'
import type { Station } from '@/lib/types'

export type StationRaumbildUploadProps = {
  slug: string
  station: Station
  onStationUpdated?: (station: Station) => void
}

export function StationRaumbildUpload({
  slug,
  station,
  onStationUpdated,
}: StationRaumbildUploadProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busyVariant, setBusyVariant] = useState<RaumbildVariant | null>(null)

  const bildPath = station.bild ?? null
  const panoPath = station.panorama360 ?? null

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

  function handleFileChange(variant: RaumbildVariant) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file || busyVariant) return
      void uploadFile(file, variant, 'reject')
    }
  }

  const busy = busyVariant !== null

  return (
    <section className="flex flex-col gap-4 rounded-gs39-md border border-border-1 bg-bg-2 p-4">
      <h3 className="font-semibold text-fg-1">Raumbilder</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-fg-2">Flat-Panorama</span>
          <code className="break-all rounded-gs39-sm border border-border-1 bg-bg-1 px-2 py-1 font-mono text-xs text-fg-2">
            {bildPath ?? '—'}
          </code>
          {bildPath && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bildPath}
              alt="Flat-Raumbild Vorschau"
              className="max-h-24 w-full rounded-gs39-sm border border-border-1 object-cover"
            />
          )}
          <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 font-semibold text-fg-1 hover:bg-bg-2">
            <span>{busyVariant === 'flat' ? 'Lädt …' : 'Flat hochladen'}</span>
            <input
              type="file"
              accept=".jpg,.jpeg,image/jpeg"
              className="sr-only"
              disabled={busy}
              onChange={handleFileChange('flat')}
            />
          </label>
          <span className="text-xs text-fg-3">
            JPEG · max. 500 KB · Seitenverhältnis min. 2,5:1
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-semibold text-fg-2">Panorama 360°</span>
          <code className="break-all rounded-gs39-sm border border-border-1 bg-bg-1 px-2 py-1 font-mono text-xs text-fg-2">
            {panoPath ?? '—'}
          </code>
          {panoPath && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={panoPath}
              alt="360°-Panorama Vorschau"
              className="max-h-24 w-full rounded-gs39-sm border border-border-1 object-cover"
            />
          )}
          <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 font-semibold text-fg-1 hover:bg-bg-2">
            <span>{busyVariant === 'pano360' ? 'Lädt …' : '360° hochladen'}</span>
            <input
              type="file"
              accept=".jpg,.jpeg,.webp,image/jpeg,image/webp"
              className="sr-only"
              disabled={busy}
              onChange={handleFileChange('pano360')}
            />
          </label>
          <span className="text-xs text-fg-3">
            JPEG oder WebP · max. 4 MB · Seitenverhältnis 2:1
          </span>
        </div>
      </div>

      {uploadError && <MpzFormAlert variant="error">{uploadError}</MpzFormAlert>}

      {success && (
        <p className="rounded-gs39-sm border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900">
          {success}
        </p>
      )}
    </section>
  )
}
