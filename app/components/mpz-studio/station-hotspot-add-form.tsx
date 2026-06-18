'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import { fetchHotspotIconPaths } from '@/components/mpz-studio/hotspot-icon-upload'
import { mpzStationCalibHref } from '@/lib/mpz-studio-calib'
import {
  MAX_ICON_SIZE_NORM,
  MIN_ICON_SIZE_NORM,
} from '@/lib/raum-viewer/constants'
import type { Station, ViewerMode } from '@/lib/types'

const DEFAULT_ICON_SIZE = 0.2
const DEFAULT_FLAT_COORD = 0.5
const DEFAULT_SPHERE_COORD = 0

export type StationHotspotAddFormProps = {
  slug: string
  station: Station
  uploadedIconPath?: string | null
}

function fieldClassName(): string {
  return 'w-full rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-fg-1'
}

function labelClassName(): string {
  return 'mb-1 block text-xs font-semibold text-fg-3'
}

function resetForm(viewer: ViewerMode) {
  return {
    id: '',
    label: '',
    mediumId: '',
    x: String(DEFAULT_FLAT_COORD),
    y: String(DEFAULT_FLAT_COORD),
    yaw: String(DEFAULT_SPHERE_COORD),
    pitch: String(DEFAULT_SPHERE_COORD),
    icon: '',
    iconSize: String(DEFAULT_ICON_SIZE),
  }
}

export function StationHotspotAddForm({
  slug,
  station,
  uploadedIconPath,
}: StationHotspotAddFormProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const viewer = station.viewer ?? 'flat'
  const isSphere = viewer === 'equirectangular'
  const medien = station.medien ?? []
  const defaultMediumId = medien[0]?.id ?? ''

  const [form, setForm] = useState(() => ({
    ...resetForm(viewer),
    mediumId: defaultMediumId,
  }))
  const [iconPaths, setIconPaths] = useState<string[]>([])
  const [iconLoadError, setIconLoadError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const reloadIcons = useCallback(async () => {
    setIconLoadError(null)
    try {
      const paths = await fetchHotspotIconPaths(slug)
      setIconPaths(paths)
    } catch (err) {
      setIconLoadError(err instanceof Error ? err.message : 'Icons konnten nicht geladen werden.')
      setIconPaths([])
    }
  }, [slug])

  useEffect(() => {
    void reloadIcons()
  }, [reloadIcons])

  useEffect(() => {
    if (uploadedIconPath) {
      setForm((prev) => ({ ...prev, icon: uploadedIconPath }))
      void reloadIcons()
    }
  }, [uploadedIconPath, reloadIcons])

  useEffect(() => {
    setForm({ ...resetForm(viewer), mediumId: defaultMediumId })
    setError(null)
    setSuccess(null)
  }, [slug, viewer, defaultMediumId])

  const ingestHref = `/mpz/studio/ingest?slug=${encodeURIComponent(slug)}`
  const calib = mpzStationCalibHref({ viewer, slug, hasBild: !!station.bild })

  if (medien.length === 0) {
    return (
      <section className="rounded-gs39-md border border-dashed border-border-1 bg-bg-1 px-4 py-6 text-sm">
        <p className="mb-2 font-semibold text-fg-1">Hotspot hinzufügen</p>
        <p className="mb-4 text-fg-3">
          Zuerst mindestens ein Medium ingestieren — Hotspots verknüpfen Medien mit Positionen im
          Raum.
        </p>
        <Link
          href={ingestHref}
          className="inline-block rounded-gs39-sm bg-accent px-4 py-2 font-semibold text-white"
        >
          Medium hinzufügen
        </Link>
      </section>
    )
  }

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const body: Record<string, unknown> = {
      id: form.id.trim(),
      mediumId: form.mediumId,
      iconSize: Number(form.iconSize),
    }

    const label = form.label.trim()
    if (label) {
      body.label = label
    }

    if (form.icon) {
      body.icon = form.icon
    }

    if (isSphere) {
      body.yaw = Number(form.yaw)
      body.pitch = Number(form.pitch)
    } else {
      body.x = Number(form.x)
      body.y = Number(form.y)
    }

    try {
      const res = await fetch(`/api/mpz/stations/${encodeURIComponent(slug)}/hotspots`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = (await res.json()) as { message?: string }

      if (!res.ok) {
        setError(json.message ?? `Fehler (${res.status})`)
        return
      }

      const calibHint = calib
        ? ' Optional: Koordinaten in der Kalibrier-UI feinjustieren.'
        : ''
      setSuccess(`Hotspot „${form.id.trim()}" angelegt.${calibHint}`)
      setForm({ ...resetForm(viewer), mediumId: defaultMediumId })
      markMpzStudioDirty()
      await validateNow()
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Netzwerkfehler')
    }
  }

  return (
    <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-4 text-sm">
      <h3 className="mb-3 font-semibold text-fg-1">Hotspot hinzufügen</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hs-id" className={labelClassName()}>
              ID
            </label>
            <input
              id="hs-id"
              type="text"
              required
              pattern="[a-z0-9][a-z0-9-]*"
              placeholder="hs-video"
              value={form.id}
              onChange={(e) => updateField('id', e.target.value)}
              className={fieldClassName()}
            />
          </div>

          <div>
            <label htmlFor="hs-label" className={labelClassName()}>
              Label (optional)
            </label>
            <input
              id="hs-label"
              type="text"
              value={form.label}
              onChange={(e) => updateField('label', e.target.value)}
              className={fieldClassName()}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="hs-medium" className={labelClassName()}>
              Medium
            </label>
            <select
              id="hs-medium"
              required
              value={form.mediumId}
              onChange={(e) => updateField('mediumId', e.target.value)}
              className={fieldClassName()}
            >
              {medien.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} ({m.typ})
                </option>
              ))}
            </select>
          </div>

          {isSphere ? (
            <>
              <div>
                <label htmlFor="hs-yaw" className={labelClassName()}>
                  yaw (°)
                </label>
                <input
                  id="hs-yaw"
                  type="number"
                  required
                  step="any"
                  min={-180}
                  max={180}
                  value={form.yaw}
                  onChange={(e) => updateField('yaw', e.target.value)}
                  className={fieldClassName()}
                />
              </div>
              <div>
                <label htmlFor="hs-pitch" className={labelClassName()}>
                  pitch (°)
                </label>
                <input
                  id="hs-pitch"
                  type="number"
                  required
                  step="any"
                  min={-90}
                  max={90}
                  value={form.pitch}
                  onChange={(e) => updateField('pitch', e.target.value)}
                  className={fieldClassName()}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="hs-x" className={labelClassName()}>
                  x
                </label>
                <input
                  id="hs-x"
                  type="number"
                  required
                  step="0.0001"
                  min={0}
                  max={1}
                  value={form.x}
                  onChange={(e) => updateField('x', e.target.value)}
                  className={fieldClassName()}
                />
              </div>
              <div>
                <label htmlFor="hs-y" className={labelClassName()}>
                  y
                </label>
                <input
                  id="hs-y"
                  type="number"
                  required
                  step="0.0001"
                  min={0}
                  max={1}
                  value={form.y}
                  onChange={(e) => updateField('y', e.target.value)}
                  className={fieldClassName()}
                />
                <p className="mt-1 text-xs text-fg-3">
                  Sichtbarer Ausschnitt: y ≈ 0,33–0,67 liegt meist im Bild.
                </p>
              </div>
            </>
          )}

          <div>
            <label htmlFor="hs-icon" className={labelClassName()}>
              Icon (optional)
            </label>
            <select
              id="hs-icon"
              value={form.icon}
              onChange={(e) => updateField('icon', e.target.value)}
              className={fieldClassName()}
            >
              <option value="">(keins — Viewer-Fallback)</option>
              {iconPaths.map((path) => (
                <option key={path} value={path}>
                  {path}
                </option>
              ))}
            </select>
            {iconLoadError && (
              <p role="alert" className="mt-1 text-xs text-brand-red">
                {iconLoadError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="hs-icon-size" className={labelClassName()}>
              iconSize
            </label>
            <input
              id="hs-icon-size"
              type="number"
              required
              step="0.01"
              min={MIN_ICON_SIZE_NORM}
              max={MAX_ICON_SIZE_NORM}
              value={form.iconSize}
              onChange={(e) => updateField('iconSize', e.target.value)}
              className={fieldClassName()}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-gs39-sm bg-accent px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {isPending ? 'Speichert …' : 'Hotspot anlegen'}
          </button>
          {calib && (
            <Link
              href={calib}
              target={isSphere ? '_blank' : undefined}
              rel={isSphere ? 'noopener noreferrer' : undefined}
              className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
            >
              {isSphere ? '↗ Kalibrieren' : 'Kalibrieren'}
            </Link>
          )}
        </div>

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
      </form>
    </section>
  )
}
