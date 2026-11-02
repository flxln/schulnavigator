'use client'

import { MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import {
  mpzButtonClassName,
  mpzFieldClassName,
  mpzLabelClassName,
} from '@/components/mpz-studio/mpz-form-primitives'
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

function typCardClassName(selected: boolean, disabled: boolean): string {
  const base =
    'flex min-h-11 flex-col items-center justify-center gap-1 rounded-gs39-sm border px-3 py-4 text-sm transition-colors'
  if (disabled) {
    return `${base} cursor-not-allowed border-border-1 opacity-50`
  }
  if (selected) {
    return `${base} border-accent bg-accent/10 font-semibold text-accent`
  }
  return `${base} border-border-1 text-fg-1 hover:bg-bg-2`
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

  const calib = mpzStationCalibHref({
    viewer,
    slug,
    hasBild: !!station.bild,
    hasPanorama360: !!station.panorama360,
  })

  if (!canAddMedium && !canAddDialog) {
    return (
      <div className="rounded-gs39-md border border-dashed border-border-1 bg-bg-1 px-4 py-6 text-sm">
        <p className="mb-2 font-semibold text-fg-1">Hotspot hinzufügen</p>
        <p className="mb-4 text-fg-3">
          Zuerst mindestens ein Medium oder einen Dialog-Block anlegen — Hotspots verknüpfen
          Medien oder Maskottchen mit Positionen im Raum.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/mpz/studio/stationen/${encodeURIComponent(slug)}?tab=medien`}
            className={mpzButtonClassName('primary')}
          >
            Medium hinzufügen
          </Link>
          <Link
            href={`/mpz/studio/stationen/${encodeURIComponent(slug)}?tab=dialog`}
            className={mpzButtonClassName('secondary')}
          >
            Dialog-Tab öffnen
          </Link>
        </div>
      </div>
    )
  }

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleActionChange(nextAction: HotspotActionKind) {
    if (nextAction === form.action) return
    if (nextAction === 'medium' && !canAddMedium) return
    if (nextAction === 'dialog' && !canAddDialog) return

    setForm((prev) => ({
      ...prev,
      action: nextAction,
      mediumId: defaultMediumId,
      mascot: defaultMascot,
    }))
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

  const medienTabHref = `/mpz/studio/stationen/${encodeURIComponent(slug)}?tab=medien`
  const dialogTabHref = `/mpz/studio/stationen/${encodeURIComponent(slug)}?tab=dialog`

  return (
    <div className="border-t border-border-1 pt-6 text-sm">
      <h3 className="mb-3 font-semibold text-fg-1">Hotspot hinzufügen</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <span className={`${mpzLabelClassName()} uppercase tracking-[0.05em]`}>
            Typ wählen
          </span>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {canAddMedium ? (
              <button
                type="button"
                onClick={() => handleActionChange('medium')}
                className={typCardClassName(form.action === 'medium', false)}
              >
                Medien-Hotspot
              </button>
            ) : (
              <div
                aria-disabled="true"
                className={typCardClassName(false, true)}
              >
                <span>Medien-Hotspot</span>
                <Link
                  href={medienTabHref}
                  className="text-xs font-semibold text-accent underline-offset-2 hover:underline"
                >
                  Zuerst Medium anlegen
                </Link>
              </div>
            )}

            {canAddDialog ? (
              <button
                type="button"
                onClick={() => handleActionChange('dialog')}
                className={typCardClassName(form.action === 'dialog', false)}
              >
                Dialog-Hotspot (Maskottchen)
              </button>
            ) : (
              <div
                aria-disabled="true"
                className={typCardClassName(false, true)}
              >
                <span>Dialog-Hotspot (Maskottchen)</span>
                <Link
                  href={dialogTabHref}
                  className="text-xs font-semibold text-accent underline-offset-2 hover:underline"
                >
                  Zuerst Dialog-Figur anlegen
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hs-id" className={mpzLabelClassName()}>
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
              className={mpzFieldClassName()}
            />
          </div>

          <div>
            <label htmlFor="hs-label" className={mpzLabelClassName()}>
              Label (optional)
            </label>
            <input
              id="hs-label"
              type="text"
              value={form.label}
              onChange={(e) => updateField('label', e.target.value)}
              className={mpzFieldClassName()}
            />
          </div>

          {isDialog ? (
            <>
              <div className="sm:col-span-2">
                <label htmlFor="hs-mascot" className={mpzLabelClassName()}>
                  Maskottchen
                </label>
                <select
                  id="hs-mascot"
                  required
                  value={form.mascot}
                  onChange={(e) => updateField('mascot', e.target.value as DialogFigure)}
                  className={mpzFieldClassName()}
                >
                  {dialogFiguren.map((figur) => (
                    <option key={figur} value={figur}>
                      {figur}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="hs-mascot-size" className={mpzLabelClassName()}>
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
                  className={mpzFieldClassName()}
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
                  <label htmlFor="hs-bubble-pitch" className={mpzLabelClassName()}>
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
                    className={mpzFieldClassName()}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="sm:col-span-2">
                <label htmlFor="hs-medium" className={mpzLabelClassName()}>
                  Medium
                </label>
                <select
                  id="hs-medium"
                  required
                  value={form.mediumId}
                  onChange={(e) => updateField('mediumId', e.target.value)}
                  className={mpzFieldClassName()}
                >
                  {medien.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} ({m.typ})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="hs-icon" className={mpzLabelClassName()}>
                  Icon (optional)
                </label>
                <select
                  id="hs-icon"
                  value={form.icon}
                  onChange={(e) => updateField('icon', e.target.value)}
                  className={mpzFieldClassName()}
                >
                  <option value="">(keins — Viewer-Fallback)</option>
                  {iconPaths.map((path) => (
                    <option key={path} value={path}>
                      {path}
                    </option>
                  ))}
                </select>
                {iconLoadError && (
                  <p role="alert" className="mt-1 text-xs text-error">
                    {iconLoadError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="hs-icon-size" className={mpzLabelClassName()}>
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
                  className={mpzFieldClassName()}
                />
              </div>
            </>
          )}

          {isSphere ? (
            <>
              <div>
                <label htmlFor="hs-yaw" className={mpzLabelClassName()}>
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
                  className={mpzFieldClassName()}
                />
              </div>
              <div>
                <label htmlFor="hs-pitch" className={mpzLabelClassName()}>
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
                  className={mpzFieldClassName()}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="hs-x" className={mpzLabelClassName()}>
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
                  className={mpzFieldClassName()}
                />
              </div>
              <div>
                <label htmlFor="hs-y" className={mpzLabelClassName()}>
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
                  className={mpzFieldClassName()}
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
            className={mpzButtonClassName('primary')}
          >
            {isPending ? 'Speichert …' : 'Hotspot anlegen'}
          </button>
          {calib && (
            <Link
              href={calib}
              className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
            >
              Kalibrieren
            </Link>
          )}
        </div>

        {error && <MpzFormAlert variant="error">{error}</MpzFormAlert>}

        {success && <MpzFormAlert variant="success">{success}</MpzFormAlert>}
      </form>
    </div>
  )
}
