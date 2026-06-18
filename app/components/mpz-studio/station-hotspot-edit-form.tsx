'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import { fetchHotspotIconPaths } from '@/components/mpz-studio/hotspot-icon-upload'
import {
  MAX_ICON_SIZE_NORM,
  MIN_ICON_SIZE_NORM,
} from '@/lib/raum-viewer/constants'
import type { Hotspot, Hotspot360, Station } from '@/lib/types'

export type StationHotspotEditFormProps = {
  slug: string
  station: Station
  hotspot: Hotspot | Hotspot360
  uploadedIconPath?: string | null
  onCancel: () => void
  onSuccess: (message: string) => void
}

function fieldClassName(): string {
  return 'w-full rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-fg-1'
}

function labelClassName(): string {
  return 'mb-1 block text-xs font-semibold text-fg-3'
}

function hotspotToForm(hotspot: Hotspot | Hotspot360) {
  const base = {
    label: hotspot.label ?? '',
    mediumId: hotspot.mediumId ?? '',
    icon: hotspot.icon ?? '',
    iconSize: hotspot.iconSize !== undefined ? String(hotspot.iconSize) : '',
  }

  if ('x' in hotspot) {
    return {
      ...base,
      x: String(hotspot.x),
      y: String(hotspot.y),
    }
  }

  const sphere = hotspot as Hotspot360
  return {
    ...base,
    yaw: String(sphere.yaw),
    pitch: String(sphere.pitch),
  }
}

export function StationHotspotEditForm({
  slug,
  station,
  hotspot,
  uploadedIconPath,
  onCancel,
  onSuccess,
}: StationHotspotEditFormProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const viewer = station.viewer ?? 'flat'
  const isSphere = viewer === 'equirectangular'
  const medien = station.medien ?? []

  const [form, setForm] = useState(() => hotspotToForm(hotspot))
  const [iconPaths, setIconPaths] = useState<string[]>([])
  const [iconLoadError, setIconLoadError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
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
    setForm(hotspotToForm(hotspot))
    setError(null)
  }, [hotspot])

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const body: Record<string, unknown> = {
      label: form.label.trim(),
      mediumId: form.mediumId,
    }

    const iconSizeRaw = form.iconSize.trim()
    body.iconSize = iconSizeRaw ? Number(iconSizeRaw) : null

    if (form.icon) {
      body.icon = form.icon
    } else {
      body.icon = ''
    }

    if (isSphere) {
      body.yaw = Number('yaw' in form ? form.yaw : 0)
      body.pitch = Number('pitch' in form ? form.pitch : 0)
    } else {
      body.x = Number('x' in form ? form.x : 0)
      body.y = Number('y' in form ? form.y : 0)
    }

    try {
      const res = await fetch(
        `/api/mpz/stations/${encodeURIComponent(slug)}/hotspots/${encodeURIComponent(hotspot.id)}`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        },
      )
      const json = (await res.json()) as { message?: string }

      if (!res.ok) {
        setError(json.message ?? `Fehler (${res.status})`)
        return
      }

      onSuccess(
        `Hotspot „${hotspot.id}" gespeichert. Für /raum/${slug} ggf. Dev-Server neu starten (Modul-Cache).`,
      )
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-t border-border-1 bg-bg-1 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-fg-3">Hotspot bearbeiten</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`edit-hs-id-${hotspot.id}`} className={labelClassName()}>
            ID (read-only)
          </label>
          <input
            id={`edit-hs-id-${hotspot.id}`}
            type="text"
            readOnly
            value={hotspot.id}
            className={`${fieldClassName()} bg-bg-2 text-fg-3`}
          />
        </div>

        <div>
          <label htmlFor={`edit-hs-label-${hotspot.id}`} className={labelClassName()}>
            Label (optional)
          </label>
          <input
            id={`edit-hs-label-${hotspot.id}`}
            type="text"
            value={form.label}
            onChange={(e) => updateField('label', e.target.value)}
            className={fieldClassName()}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`edit-hs-medium-${hotspot.id}`} className={labelClassName()}>
            Medium
          </label>
          <select
            id={`edit-hs-medium-${hotspot.id}`}
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
              <label htmlFor={`edit-hs-yaw-${hotspot.id}`} className={labelClassName()}>
                yaw (°)
              </label>
              <input
                id={`edit-hs-yaw-${hotspot.id}`}
                type="number"
                required
                step="any"
                min={-180}
                max={180}
                value={'yaw' in form ? form.yaw : '0'}
                onChange={(e) => updateField('yaw' as keyof typeof form, e.target.value)}
                className={fieldClassName()}
              />
            </div>
            <div>
              <label htmlFor={`edit-hs-pitch-${hotspot.id}`} className={labelClassName()}>
                pitch (°)
              </label>
              <input
                id={`edit-hs-pitch-${hotspot.id}`}
                type="number"
                required
                step="any"
                min={-90}
                max={90}
                value={'pitch' in form ? form.pitch : '0'}
                onChange={(e) => updateField('pitch' as keyof typeof form, e.target.value)}
                className={fieldClassName()}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label htmlFor={`edit-hs-x-${hotspot.id}`} className={labelClassName()}>
                x
              </label>
              <input
                id={`edit-hs-x-${hotspot.id}`}
                type="number"
                required
                step="0.0001"
                min={0}
                max={1}
                value={'x' in form ? form.x : '0'}
                onChange={(e) => updateField('x' as keyof typeof form, e.target.value)}
                className={fieldClassName()}
              />
            </div>
            <div>
              <label htmlFor={`edit-hs-y-${hotspot.id}`} className={labelClassName()}>
                y
              </label>
              <input
                id={`edit-hs-y-${hotspot.id}`}
                type="number"
                required
                step="0.0001"
                min={0}
                max={1}
                value={'y' in form ? form.y : '0'}
                onChange={(e) => updateField('y' as keyof typeof form, e.target.value)}
                className={fieldClassName()}
              />
              <p className="mt-1 text-xs text-fg-3">
                Sichtbarer Ausschnitt: y ≈ 0,33–0,67 liegt meist im Bild.
              </p>
            </div>
          </>
        )}

        <div>
          <label htmlFor={`edit-hs-icon-${hotspot.id}`} className={labelClassName()}>
            Icon (optional)
          </label>
          <select
            id={`edit-hs-icon-${hotspot.id}`}
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
          <label htmlFor={`edit-hs-icon-size-${hotspot.id}`} className={labelClassName()}>
            iconSize (optional)
          </label>
          <input
            id={`edit-hs-icon-size-${hotspot.id}`}
            type="number"
            step="0.01"
            min={MIN_ICON_SIZE_NORM}
            max={MAX_ICON_SIZE_NORM}
            placeholder="leer = Viewer-Default"
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
          {isPending ? 'Speichert …' : 'Änderungen speichern'}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={onCancel}
          className="rounded-gs39-sm border border-border-1 px-4 py-2 font-semibold text-fg-2 disabled:opacity-50"
        >
          Abbrechen
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-gs39-sm border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </p>
      )}
    </form>
  )
}
