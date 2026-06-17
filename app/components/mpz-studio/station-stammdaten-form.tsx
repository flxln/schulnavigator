'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
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

  useEffect(() => {
    if (!station) return
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
      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 text-sm text-fg-2">
        <p role="alert">Station fehlt in stations.json.</p>
      </section>
    )
  }

  const stationRef = station

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

  const inputClass =
    'rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-fg-1 disabled:opacity-60'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
      <label className="flex flex-col gap-1">
        <span className="font-semibold text-fg-2">Slug (read-only)</span>
        <code className={`font-mono text-xs ${inputClass}`}>{slug}</code>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-semibold text-fg-2">Titel</span>
        <input
          type="text"
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          className={inputClass}
          aria-invalid={fieldErrors.titel ? true : undefined}
        />
        {fieldErrors.titel && (
          <span className="text-sm text-red-700" role="alert">
            {fieldErrors.titel}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-semibold text-fg-2">Beschreibung</span>
        <textarea
          rows={5}
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          className={inputClass}
          aria-invalid={fieldErrors.beschreibung ? true : undefined}
        />
        {fieldErrors.beschreibung && (
          <span className="text-sm text-red-700" role="alert">
            {fieldErrors.beschreibung}
          </span>
        )}
      </label>

      <div className="flex flex-col gap-1">
        <span className="font-semibold text-fg-2">Viewer</span>
        <select
          value={viewer}
          onChange={(e) => setViewer(e.target.value as ViewerMode)}
          disabled={viewerBlocked}
          title={
            viewerBlocked
              ? 'Viewer-Wechsel gesperrt — diese Station hat Hotspots. Zuerst im Tab Hotspots entfernen.'
              : undefined
          }
          className={inputClass}
          aria-invalid={fieldErrors.viewer ? true : undefined}
        >
          <option value="flat">flat</option>
          <option value="equirectangular">equirectangular (360°)</option>
        </select>
        {viewerBlocked && (
          <p className="text-fg-3">
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
          <span className="text-sm text-red-700" role="alert">
            {fieldErrors.viewer}
          </span>
        )}
        {viewerWarnings.length > 0 && (
          <ul className="rounded-gs39-sm border border-amber-300 bg-amber-50 px-3 py-2 text-amber-950">
            {viewerWarnings.map((w) => (
              <li key={w.kind}>— {w.message}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-fg-2">Raumbild (read-only)</span>
          <code className={`break-all font-mono text-xs ${inputClass}`}>
            {stationRef.bild ?? '—'}
          </code>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-fg-2">Panorama 360° (read-only)</span>
          <code className={`break-all font-mono text-xs ${inputClass}`}>
            {stationRef.panorama360 ?? '—'}
          </code>
        </label>
      </div>
      <p className="text-fg-3">
        Raumbilder manuell unter <code className="font-mono text-xs">public/stations/</code>{' '}
        ablegen.
      </p>

      <button
        type="submit"
        disabled={busy}
        className="w-fit rounded-gs39-sm bg-accent px-4 py-2 font-semibold text-white disabled:opacity-60"
      >
        {busy ? 'Speichert …' : 'Übernehmen'}
      </button>

      {fieldErrors.form && (
        <p
          role="alert"
          className="rounded-gs39-sm border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {fieldErrors.form}
        </p>
      )}

      {success && (
        <p className="rounded-gs39-sm border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900">
          {success}
        </p>
      )}
    </form>
  )
}
