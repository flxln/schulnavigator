'use client'

import { MpzCard } from '@/components/mpz-studio/mpz-card'
import { MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import {
  mpzButtonClassName,
  mpzFieldClassName,
  mpzLabelClassName,
  mpzSelectClassName,
  mpzStackClassName,
  mpzTextareaClassName,
} from '@/components/mpz-studio/mpz-form-primitives'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import { StationRaumbildUpload } from '@/components/mpz-studio/station-raumbild-upload'
import {
  getViewerChangeWarnings,
  hasBlockingHotspots,
} from '@/lib/mpz-viewer-warnings'
import type { Station, ViewerMode } from '@/lib/types'

export type StationStammdatenFormProps = {
  slug: string
  station: Station | null
}

type FieldErrors = {
  titel?: string
  beschreibung?: string
  viewer?: string
  form?: string
}

function resolveViewer(station: Station): ViewerMode {
  return station.viewer ?? 'flat'
}

export function StationStammdatenForm({ slug, station }: StationStammdatenFormProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const [titel, setTitel] = useState(station?.titel ?? '')
  const [beschreibung, setBeschreibung] = useState(station?.beschreibung ?? '')
  const [viewer, setViewer] = useState<ViewerMode>(
    station ? resolveViewer(station) : 'flat',
  )
  const [busy, setBusy] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [success, setSuccess] = useState<string | null>(null)
  const [localStation, setLocalStation] = useState<Station | null>(station)

  useEffect(() => {
    if (!station) return
    setLocalStation(station)
    setTitel(station.titel)
    setBeschreibung(station.beschreibung)
    setViewer(resolveViewer(station))
    setFieldErrors({})
    setSuccess(null)
  }, [station])

  const viewerBlocked = station ? hasBlockingHotspots(station) : false

  const viewerWarnings = useMemo(() => {
    if (!station) return []
    const current = resolveViewer(station)
    if (viewer === current) return []
    return getViewerChangeWarnings(station, viewer)
  }, [station, viewer])

  if (!station) {
    return (
      <MpzCard>
        <MpzFormAlert variant="error">Station fehlt in stations.json.</MpzFormAlert>
      </MpzCard>
    )
  }

  const stationRef = localStation ?? station

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})
    setSuccess(null)

    const patch: { titel?: string; beschreibung?: string; viewer?: ViewerMode } = {}
    const nextErrors: FieldErrors = {}

    const trimmedTitel = titel.trim()
    const trimmedBeschreibung = beschreibung.trim()

    if (!trimmedTitel) {
      nextErrors.titel = 'Titel darf nicht leer sein.'
    }
    if (!trimmedBeschreibung) {
      nextErrors.beschreibung = 'Beschreibung darf nicht leer sein.'
    }

    if (trimmedTitel !== stationRef.titel) {
      patch.titel = trimmedTitel
    }
    if (trimmedBeschreibung !== stationRef.beschreibung) {
      patch.beschreibung = trimmedBeschreibung
    }
    const currentViewer = resolveViewer(stationRef)
    if (viewer !== currentViewer && !viewerBlocked) {
      patch.viewer = viewer
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    if (Object.keys(patch).length === 0) {
      setFieldErrors({ form: 'Keine Änderungen zum Speichern.' })
      return
    }

    setBusy(true)
    try {
      const res = await fetch(`/api/mpz/stations/${encodeURIComponent(slug)}/stammdaten`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const json = (await res.json()) as {
        message?: string
        error?: string
        warnings?: { message: string }[]
      }

      if (!res.ok) {
        const code = json.error ?? 'unknown'
        const message = json.message ?? `Fehler (${res.status})`
        if (code === 'EMPTY_FIELD') {
          if (message.toLowerCase().includes('titel')) {
            setFieldErrors({ titel: message })
          } else if (message.toLowerCase().includes('beschreibung')) {
            setFieldErrors({ beschreibung: message })
          } else {
            setFieldErrors({ form: message })
          }
          return
        }
        if (code === 'INVALID_VIEWER') {
          setFieldErrors({ viewer: message })
          return
        }
        if (code === 'VALIDATION') {
          setFieldErrors({
            form: `Konflikt beim Speichern — bitte Hotspots prüfen. ${message}`,
          })
          return
        }
        setFieldErrors({ form: message })
        return
      }

      const warningHint =
        json.warnings && json.warnings.length > 0
          ? ` Hinweise: ${json.warnings.map((w) => w.message).join(' ')}`
          : ''

      setSuccess(
        `Stammdaten gespeichert. Für /raum/${slug} den Dev-Server neu starten (Modul-Cache).${warningHint}`,
      )
      markMpzStudioDirty()
      await validateNow()
      router.refresh()
    } catch (err) {
      setFieldErrors({
        form: err instanceof Error ? err.message : 'Netzwerkfehler',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${mpzStackClassName('lg')} text-sm`}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="stammdaten-slug" className={mpzLabelClassName()}>
            Slug
          </label>
          <input
            id="stammdaten-slug"
            type="text"
            readOnly
            value={slug}
            className={`${mpzFieldClassName()} read-only:bg-bg-2 font-mono text-xs`}
          />
          <p className="mt-1 text-xs text-fg-3">
            System-ID der Station, kann nicht nachträglich geändert werden.
          </p>
        </div>

        <div>
          <label htmlFor="stammdaten-viewer" className={mpzLabelClassName()}>
            Viewer
          </label>
          <select
            id="stammdaten-viewer"
            value={viewer}
            onChange={(e) => setViewer(e.target.value as ViewerMode)}
            disabled={viewerBlocked}
            title={
              viewerBlocked
                ? 'Viewer-Wechsel gesperrt — diese Station hat Hotspots. Zuerst im Tab Hotspots entfernen.'
                : undefined
            }
            className={mpzSelectClassName()}
            aria-invalid={fieldErrors.viewer ? true : undefined}
          >
            <option value="flat">Flat</option>
            <option value="equirectangular">360° (equirectangular)</option>
          </select>
          {viewerBlocked && (
            <p className="mt-1 text-xs text-fg-3">
              Viewer-Wechsel gesperrt — diese Station hat Hotspots.{' '}
              <Link
                href={`/mpz/studio/stationen/${encodeURIComponent(slug)}?tab=hotspots`}
                className="font-semibold text-accent underline-offset-2 hover:underline"
              >
                Im Hotspots-Tab entfernen
              </Link>
              .
            </p>
          )}
          {fieldErrors.viewer && (
            <p className="mt-1 text-sm text-error" role="alert">
              {fieldErrors.viewer}
            </p>
          )}
        </div>
      </div>

      {viewerWarnings.length > 0 && (
        <ul
          className="rounded-gs39-sm border border-warn/50 bg-warn/15 px-3 py-2 text-sm text-fg-1"
          role="status"
        >
          {viewerWarnings.map((w) => (
            <li key={w.kind}>— {w.message}</li>
          ))}
        </ul>
      )}

      <div>
        <label htmlFor="stammdaten-titel" className={mpzLabelClassName()}>
          Titel
        </label>
        <input
          id="stammdaten-titel"
          type="text"
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          className={mpzFieldClassName()}
          aria-invalid={fieldErrors.titel ? true : undefined}
        />
        {fieldErrors.titel && (
          <p className="mt-1 text-sm text-error" role="alert">
            {fieldErrors.titel}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="stammdaten-beschreibung" className={mpzLabelClassName()}>
          Beschreibung
        </label>
        <textarea
          id="stammdaten-beschreibung"
          rows={5}
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          className={mpzTextareaClassName()}
          aria-invalid={fieldErrors.beschreibung ? true : undefined}
        />
        {fieldErrors.beschreibung && (
          <p className="mt-1 text-sm text-error" role="alert">
            {fieldErrors.beschreibung}
          </p>
        )}
      </div>

      <StationRaumbildUpload
        slug={slug}
        station={stationRef}
        viewer={viewer}
        onStationUpdated={setLocalStation}
      />

      <button type="submit" disabled={busy} className={mpzButtonClassName('primary')}>
        {busy ? 'Speichert …' : 'Übernehmen'}
      </button>

      {fieldErrors.form && (
        <MpzFormAlert variant="error">{fieldErrors.form}</MpzFormAlert>
      )}

      {success && <MpzFormAlert variant="success">{success}</MpzFormAlert>}
    </form>
  )
}
