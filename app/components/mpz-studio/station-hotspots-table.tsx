'use client'

import { MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import {
  MpzDataTable,
  MpzDataTableBody,
  MpzDataTableHead,
} from '@/components/mpz-studio/mpz-data-table'
import { mpzButtonClassName } from '@/components/mpz-studio/mpz-form-primitives'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Fragment, useEffect, useState, useTransition } from 'react'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import { HotspotIconUpload } from '@/components/mpz-studio/hotspot-icon-upload'
import { StationHotspotAddForm } from '@/components/mpz-studio/station-hotspot-add-form'
import { StationHotspotEditForm } from '@/components/mpz-studio/station-hotspot-edit-form'
import {
  formatHotspotCoordsFlat,
  formatHotspotCoordsSphere,
  formatHotspotRowLink,
} from '@/lib/mpz-hotspot-display'
import { mpzStationCalibHref } from '@/lib/mpz-studio-calib'
import type { Hotspot, Hotspot360, Station, ViewerMode } from '@/lib/types'

export type StationHotspotsTableProps = {
  slug: string
  station: Station | null
}

function viewerSectionLabel(viewer: ViewerMode): string {
  return viewer === 'equirectangular' ? 'Hotspots 360°' : 'Hotspots (Flat)'
}

function calibLabel(viewer: ViewerMode): string {
  return viewer === 'equirectangular' ? 'Sphere kalibrieren' : 'Hotspot kalibrieren'
}

function buildConfirmMessage(hotspotId: string): string {
  return `Hotspot „${hotspotId}" wirklich aus stations.json entfernen?`
}

function successMessage(slug: string): string {
  return `Hotspot entfernt. Für /raum/${slug} ggf. Dev-Server neu starten (Modul-Cache).`
}

export function StationHotspotsTable({ slug, station }: StationHotspotsTableProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploadedIconPath, setUploadedIconPath] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
    setSuccess(null)
    setRemovingId(null)
    setEditingId(null)
  }, [station])

  if (!station) {
    return <MpzFormAlert variant="error">Station fehlt in stations.json.</MpzFormAlert>
  }

  const activeStation = station
  const viewer = activeStation.viewer ?? 'flat'
  const calib = mpzStationCalibHref({
    viewer,
    slug,
    hasBild: !!activeStation.bild,
    hasPanorama360: !!activeStation.panorama360,
  })
  const isSphere = viewer === 'equirectangular'
  const hotspots = isSphere ? (activeStation.hotspots360 ?? []) : (activeStation.hotspots ?? [])
  const arrayLabel = isSphere ? 'hotspots360[]' : 'hotspots[]'
  const coordHint = isSphere
    ? 'yaw ∈ [-180, 180] · pitch ∈ [-90, 90]'
    : 'x/y ∈ [0, 1]'

  async function handleRemove(hotspotId: string) {
    if (!window.confirm(buildConfirmMessage(hotspotId))) {
      return
    }

    setError(null)
    setSuccess(null)
    setRemovingId(hotspotId)

    try {
      const res = await fetch(
        `/api/mpz/stations/${encodeURIComponent(slug)}/hotspots/${encodeURIComponent(hotspotId)}`,
        { method: 'DELETE' },
      )
      const json = (await res.json()) as { message?: string; error?: string }

      if (!res.ok) {
        setError(json.message ?? `Fehler (${res.status})`)
        return
      }

      setSuccess(successMessage(slug))
      markMpzStudioDirty()
      await validateNow()
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Netzwerkfehler')
    } finally {
      setRemovingId(null)
    }
  }

  function renderRow(hs: Hotspot | Hotspot360) {
    const coords = isSphere
      ? formatHotspotCoordsSphere(hs as Hotspot360)
      : formatHotspotCoordsFlat(hs as Hotspot)
    const rowBusy = isPending || removingId === hs.id
    const isEditing = editingId === hs.id

    return (
      <Fragment key={hs.id}>
        <tr className="border-b border-border-1 last:border-b-0">
          <td className="min-h-11 px-3 py-2 font-mono text-xs text-fg-1">{hs.id}</td>
          <td className="min-h-11 px-3 py-2 text-fg-2">{hs.label ?? '—'}</td>
          <td className="min-h-11 px-3 py-2 font-mono text-xs text-fg-2">{coords}</td>
          <td className="min-h-11 px-3 py-2 font-mono text-xs text-fg-2">
            {formatHotspotRowLink(hs)}
          </td>
          <td className="min-h-11 px-3 py-2">
            <div className="flex flex-wrap items-center gap-3">
              {calib && (
                <Link
                  href={calib}
                  className="font-semibold text-accent underline-offset-2 hover:underline"
                >
                  Kalibrieren
                </Link>
              )}
              <button
                type="button"
                disabled={rowBusy || isEditing}
                onClick={() => {
                  setError(null)
                  setSuccess(null)
                  setEditingId(hs.id)
                }}
                className="font-semibold text-accent disabled:opacity-50"
              >
                {isEditing ? 'Bearbeiten …' : 'Bearbeiten'}
              </button>
              <button
                type="button"
                disabled={rowBusy || isEditing}
                onClick={() => handleRemove(hs.id)}
                className="font-semibold text-error disabled:opacity-50"
              >
                {rowBusy ? 'Entfernt …' : 'Entfernen'}
              </button>
            </div>
          </td>
        </tr>
        {isEditing && (
          <tr>
            <td colSpan={5} className="p-0">
              <StationHotspotEditForm
                slug={slug}
                station={activeStation}
                hotspot={hs}
                uploadedIconPath={uploadedIconPath}
                onCancel={() => setEditingId(null)}
                onSuccess={(message) => {
                  setSuccess(message)
                  setEditingId(null)
                }}
              />
            </td>
          </tr>
        )}
      </Fragment>
    )
  }

  return (
    <div className="flex flex-col gap-6 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-fg-1">{viewerSectionLabel(viewer)}</h3>
          <p className="mt-1 text-fg-2">
            {hotspots.length}{' '}
            {hotspots.length === 1 ? 'Hotspot' : 'Hotspots'} in{' '}
            <code className="font-mono text-xs">{arrayLabel}</code>
          </p>
          <p className="mt-1 text-xs text-fg-3">{coordHint}</p>
        </div>
        {calib ? (
          <Link href={calib} className={mpzButtonClassName('primary')}>
            {calibLabel(viewer)}
          </Link>
        ) : (
          <p className="text-xs text-fg-3">
            {isSphere
              ? 'Panorama fehlt — Kalibrierung nicht verfügbar.'
              : 'Raumbild fehlt — Kalibrierung nicht verfügbar.'}
          </p>
        )}
      </div>

      <div className="border-t border-border-1 pt-6">
        <h3 className="mb-3 font-semibold text-fg-1">Hotspot-Icons</h3>
        <HotspotIconUpload slug={slug} onUploaded={setUploadedIconPath} />
      </div>

      <StationHotspotAddForm
        slug={slug}
        station={activeStation}
        uploadedIconPath={uploadedIconPath}
      />

      <MpzDataTable className="rounded-gs39-md border border-border-1">
        <MpzDataTableHead>
          <th className="px-3 py-2">ID</th>
          <th className="px-3 py-2">Label</th>
          <th className="px-3 py-2">Koordinaten</th>
          <th className="px-3 py-2">Verknüpfung</th>
          <th className="px-3 py-2">
            <span className="sr-only">Aktionen</span>
          </th>
        </MpzDataTableHead>
        <MpzDataTableBody>
          {hotspots.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-8 text-center text-fg-3">
                Noch keine Hotspots. Kalibrierung nutzen oder unten anlegen.
              </td>
            </tr>
          ) : (
            hotspots.map(renderRow)
          )}
        </MpzDataTableBody>
      </MpzDataTable>

      {error && <MpzFormAlert variant="error">{error}</MpzFormAlert>}

      {success && <MpzFormAlert variant="success">{success}</MpzFormAlert>}
    </div>
  )
}
