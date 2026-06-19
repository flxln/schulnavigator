'use client'

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

function calibLabel(viewer: ViewerMode): string {
  return viewer === 'equirectangular'
    ? 'Kalibrieren (Hotspots + Startblick)'
    : 'Hotspot kalibrieren'
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
    return (
      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 text-sm text-fg-2">
        <p role="alert">Station fehlt in stations.json.</p>
      </section>
    )
  }

  const activeStation = station
  const viewer = activeStation.viewer ?? 'flat'
  const calib = mpzStationCalibHref({
    viewer,
    slug,
    hasBild: !!activeStation.bild,
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
          <td className="px-3 py-2 font-mono text-xs text-fg-1">{hs.id}</td>
          <td className="px-3 py-2 text-fg-2">{hs.label ?? '—'}</td>
          <td className="px-3 py-2 font-mono text-xs text-fg-2">{coords}</td>
          <td className="px-3 py-2 font-mono text-xs text-fg-2">
            {formatHotspotRowLink(hs)}
          </td>
          <td className="px-3 py-2">
            <div className="flex flex-wrap items-center gap-3">
              {calib && (
                <Link
                  href={calib}
                  target={isSphere ? '_blank' : undefined}
                  rel={isSphere ? 'noopener noreferrer' : undefined}
                  className="font-semibold text-accent underline-offset-2 hover:underline"
                >
                  {isSphere ? '↗ Sphere-App' : 'Kalibrieren'}
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
                className="font-semibold text-brand-red disabled:opacity-50"
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
    <div className="flex flex-col gap-4 text-sm">
      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-4">
        <h3 className="mb-3 font-semibold text-fg-1">Hotspot-Icons</h3>
        <HotspotIconUpload slug={slug} onUploaded={setUploadedIconPath} />
      </section>

      <StationHotspotAddForm
        slug={slug}
        station={activeStation}
        uploadedIconPath={uploadedIconPath}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-fg-2">
            {hotspots.length}{' '}
            {hotspots.length === 1 ? 'Hotspot' : 'Hotspots'} in{' '}
            <code className="font-mono text-xs">{arrayLabel}</code>
          </p>
          <p className="mt-1 text-xs text-fg-3">{coordHint}</p>
        </div>
        {calib ? (
          <Link
            href={calib}
            target={isSphere ? '_blank' : undefined}
            rel={isSphere ? 'noopener noreferrer' : undefined}
            className="rounded-gs39-sm bg-accent px-3 py-2 font-semibold text-white"
          >
            {calibLabel(viewer)}
          </Link>
        ) : (
          <p className="text-xs text-fg-3">Raumbild fehlt — Kalibrierung nicht verfügbar.</p>
        )}
      </div>

      {hotspots.length === 0 ? (
        <div className="rounded-gs39-md border border-dashed border-border-1 bg-bg-1 px-4 py-8 text-center">
          <p className="mb-3 font-semibold text-fg-1">Keine Hotspots</p>
          <p className="mb-4 text-fg-3">
            {isSphere
              ? 'Koordinaten über die Sphere-Kalibrierung in der Besucher-App setzen.'
              : 'Klicke auf Kalibrieren, um Koordinaten direkt im Panorama zu setzen.'}
          </p>
          {calib && (
            <Link
              href={calib}
              target={isSphere ? '_blank' : undefined}
              rel={isSphere ? 'noopener noreferrer' : undefined}
              className="inline-block rounded-gs39-sm bg-accent px-4 py-2 font-semibold text-white"
            >
              {calibLabel(viewer)}
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-gs39-md border border-border-1">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border-1 bg-bg-1 text-xs font-semibold uppercase tracking-wide text-fg-3">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Koordinaten</th>
                <th className="px-3 py-2">Verknüpfung</th>
                <th className="px-3 py-2">
                  <span className="sr-only">Aktionen</span>
                </th>
              </tr>
            </thead>
            <tbody>{hotspots.map(renderRow)}</tbody>
          </table>
        </div>
      )}

      {isSphere && hotspots.length > 0 && (
        <p className="text-xs text-fg-3">
          Sphere-Kalibrierung:{' '}
          <code className="font-mono">/raum/{slug}?hotspot-calib=1</code>
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-gs39-sm border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-gs39-sm border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900">
          {success}
        </p>
      )}
    </div>
  )
}
