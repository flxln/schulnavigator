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
  DEFAULT_MASCOT_SIZE_NORM,
  MAX_ICON_SIZE_NORM,
  MAX_MASCOT_SIZE_NORM,
  MIN_ICON_SIZE_NORM,
  MIN_MASCOT_SIZE_NORM,
} from '@/lib/raum-viewer/constants'
import type { DialogFigure, Station, ViewerMode } from '@/lib/types'

const DEFAULT_FLAT_COORD = 0.5
const DEFAULT_SPHERE_COORD = 0

type HotspotActionKind = 'medium' | 'dialog'

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

function resetForm(viewer: ViewerMode, action: HotspotActionKind, defaults: {
  mediumId: string
  mascot: DialogFigure
}) {
  return {
    action,
    id: '',
    label: '',
    mediumId: defaults.mediumId,
    mascot: defaults.mascot,
    mascotSize: String(DEFAULT_MASCOT_SIZE_NORM),
    mascotFlipX: false,
    bubblePitchOffset: '',
    x: String(DEFAULT_FLAT_COORD),
    y: String(DEFAULT_FLAT_COORD),
    yaw: String(DEFAULT_SPHERE_COORD),
    pitch: String(DEFAULT_SPHERE_COORD),
    icon: '',
    iconSize: '',
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
  const dialogFiguren = station.dialog?.figuren ?? []
  const hasMedien = medien.length > 0
  const hasDialog = dialogFiguren.length > 0
  const canAddMedium = hasMedien
  const canAddDialog = hasDialog
  const defaultMediumId = medien[0]?.id ?? ''
  const defaultMascot = dialogFiguren[0] ?? 'frieda'

  const [form, setForm] = useState(() =>
    resetForm(viewer, canAddMedium ? 'medium' : 'dialog', {
      mediumId: defaultMediumId,
      mascot: defaultMascot,
    }),
  )
  const [iconPaths, setIconPaths] = useState<string[]>([])
  const [iconLoadError, setIconLoadError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isDialog = form.action === 'dialog'

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
    if (uploadedIconPath && !isDialog) {
      setForm((prev) => ({ ...prev, icon: uploadedIconPath }))
      void reloadIcons()
    }
  }, [uploadedIconPath, reloadIcons, isDialog])

  useEffect(() => {
    const nextAction: HotspotActionKind = canAddMedium ? 'medium' : 'dialog'
    setForm(
      resetForm(viewer, nextAction, {
        mediumId: defaultMediumId,
        mascot: defaultMascot,
      }),
    )
    setError(null)
    setSuccess(null)
  }, [slug, viewer, defaultMediumId, defaultMascot, canAddMedium])

  const calib = mpzStationCalibHref({ viewer, slug, hasBild: !!station.bild })

  if (!canAddMedium && !canAddDialog) {
    return (
      <section className="rounded-gs39-md border border-dashed border-border-1 bg-bg-1 px-4 py-6 text-sm">
        <p className="mb-2 font-semibold text-fg-1">Hotspot hinzufügen</p>
        <p className="mb-4 text-fg-3">
          Zuerst mindestens ein Medium oder einen Dialog-Block anlegen — Hotspots verknüpfen
          Medien oder Maskottchen mit Positionen im Raum.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/mpz/studio/stationen/${encodeURIComponent(slug)}?tab=medien`}
            className="inline-block rounded-gs39-sm bg-accent px-4 py-2 font-semibold text-white"
          >
            Medium hinzufügen
          </Link>
          <Link
            href={`/mpz/studio/stationen/${encodeURIComponent(slug)}?tab=dialog`}
            className="inline-block rounded-gs39-sm border border-border-1 px-4 py-2 font-semibold text-fg-2"
          >
            Dialog-Tab öffnen
          </Link>
        </div>
      </section>
    )
  }

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleActionChange(nextAction: HotspotActionKind) {
    setForm(
      resetForm(viewer, nextAction, {
        mediumId: defaultMediumId,
        mascot: defaultMascot,
      }),
    )
    setError(null)
    setSuccess(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const body: Record<string, unknown> = {
      id: form.id.trim(),
    }

    const label = form.label.trim()
    if (label) {
      body.label = label
    }

    if (isDialog) {
      body.action = 'dialog'
      body.mascot = form.mascot

      const mascotSizeRaw = form.mascotSize.trim()
      if (mascotSizeRaw && Number(mascotSizeRaw) !== DEFAULT_MASCOT_SIZE_NORM) {
        body.mascotSize = Number(mascotSizeRaw)
      }

      if (form.mascotFlipX) {
        body.mascotFlipX = true
      }

      if (isSphere) {
        const bubbleRaw = form.bubblePitchOffset.trim()
        if (bubbleRaw) {
          body.bubblePitchOffset = Number(bubbleRaw)
        }
      }
    } else {
      body.mediumId = form.mediumId

      const iconSizeRaw = form.iconSize.trim()
      if (iconSizeRaw) {
        body.iconSize = Number(iconSizeRaw)
      }

      if (form.icon) {
        body.icon = form.icon
      }
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
      setForm(
        resetForm(viewer, form.action, {
          mediumId: defaultMediumId,
          mascot: defaultMascot,
        }),
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
    <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-4 text-sm">
      <h3 className="mb-3 font-semibold text-fg-1">Hotspot hinzufügen</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="hs-action" className={labelClassName()}>
            Typ
          </label>
          <select
            id="hs-action"
            value={form.action}
            onChange={(e) => handleActionChange(e.target.value as HotspotActionKind)}
            className={fieldClassName()}
          >
            {canAddMedium && <option value="medium">Medien-Hotspot</option>}
            {canAddDialog && <option value="dialog">Dialog-Hotspot (Maskottchen)</option>}
          </select>
        </div>

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

          {isDialog ? (
            <>
              <div className="sm:col-span-2">
                <label htmlFor="hs-mascot" className={labelClassName()}>
                  Maskottchen
                </label>
                <select
                  id="hs-mascot"
                  required
                  value={form.mascot}
                  onChange={(e) => updateField('mascot', e.target.value as DialogFigure)}
                  className={fieldClassName()}
                >
                  {dialogFiguren.map((figur) => (
                    <option key={figur} value={figur}>
                      {figur}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="hs-mascot-size" className={labelClassName()}>
                  mascotSize (optional)
                </label>
                <input
                  id="hs-mascot-size"
                  type="number"
                  step="0.01"
                  min={MIN_MASCOT_SIZE_NORM}
                  max={MAX_MASCOT_SIZE_NORM}
                  placeholder={`Default ${DEFAULT_MASCOT_SIZE_NORM}`}
                  value={form.mascotSize}
                  onChange={(e) => updateField('mascotSize', e.target.value)}
                  className={fieldClassName()}
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-fg-2">
                  <input
                    type="checkbox"
                    checked={form.mascotFlipX}
                    onChange={(e) => updateField('mascotFlipX', e.target.checked)}
                  />
                  mascotFlipX (horizontal spiegeln)
                </label>
              </div>

              {isSphere && (
                <div>
                  <label htmlFor="hs-bubble-pitch" className={labelClassName()}>
                    bubblePitchOffset (optional, °)
                  </label>
                  <input
                    id="hs-bubble-pitch"
                    type="number"
                    step="any"
                    min={-45}
                    max={45}
                    placeholder="leer = Viewer-Default"
                    value={form.bubblePitchOffset}
                    onChange={(e) => updateField('bubblePitchOffset', e.target.value)}
                    className={fieldClassName()}
                  />
                </div>
              )}
            </>
          ) : (
            <>
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
                  iconSize (optional)
                </label>
                <input
                  id="hs-icon-size"
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
            </>
          )}

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
