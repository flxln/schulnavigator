'use client'

import { useRouter } from 'next/navigation'
import { Fragment, useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { DialogAudioStateBadge } from '@/components/mpz-studio/dialog-audio-status-badges'
import {
  MpzDataTable,
  MpzDataTableBody,
  MpzDataTableHead,
} from '@/components/mpz-studio/mpz-data-table'
import { MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import { StationDialogBubbleForm } from '@/components/mpz-studio/station-dialog-bubble-form'
import { StationDialogGruppeForm } from '@/components/mpz-studio/station-dialog-gruppe-form'
import { StationDialogSegmentAudioRow } from '@/components/mpz-studio/station-dialog-segment-audio-row'
import { StationDialogSegmentForm } from '@/components/mpz-studio/station-dialog-segment-form'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import type { DialogSegmentAudit } from '@/lib/mpz-dialog-audio-ingest'
import type { DialogFigure, Station } from '@/lib/types'

interface StatusResponse {
  slug: string
  segments: DialogSegmentAudit[]
  orphans: string[]
  missingCount: number
  driftCount: number
}

export type StationDialogPanelProps = {
  slug: string
  station: Station | null
}

export function StationDialogPanel({ slug, station }: StationDialogPanelProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const dialog = station?.dialog
  const [figuren, setFiguren] = useState<DialogFigure[]>(dialog?.figuren ?? [])
  const [audioStatus, setAudioStatus] = useState<StatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null)
  const [addingSegment, setAddingSegment] = useState(false)
  const [editingGruppeId, setEditingGruppeId] = useState<string | null>(null)
  const [addingGruppe, setAddingGruppe] = useState(false)
  const [expandedAudioSegmentId, setExpandedAudioSegmentId] = useState<string | null>(null)
  const [gruppenOpen, setGruppenOpen] = useState(false)
  const [bubbleOpen, setBubbleOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const audioBySegmentId = useMemo(() => {
    const map = new Map<string, DialogSegmentAudit>()
    for (const seg of audioStatus?.segments ?? []) {
      map.set(seg.segmentId, seg)
    }
    return map
  }, [audioStatus])

  const loadAudioStatus = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/mpz/dialog-audio/status?slug=${encodeURIComponent(slug)}`,
      )
      const json = (await res.json()) as StatusResponse & { message?: string }
      if (res.ok) {
        setAudioStatus(json)
      }
    } catch {
      setAudioStatus(null)
    }
  }, [slug])

  useEffect(() => {
    setFiguren(dialog?.figuren ?? [])
    setEditingSegmentId(null)
    setAddingSegment(false)
    setEditingGruppeId(null)
    setAddingGruppe(false)
    setExpandedAudioSegmentId(null)
    setGruppenOpen(false)
    setBubbleOpen(false)
    setError(null)
    setSuccess(null)
  }, [dialog, slug])

  useEffect(() => {
    void loadAudioStatus()
  }, [loadAudioStatus, station])

  function toggleFigur(figur: DialogFigure) {
    setFiguren((prev) => {
      if (prev.includes(figur)) {
        return prev.filter((f) => f !== figur)
      }
      return [...prev, figur]
    })
  }

  const dialogHotspotCount = useMemo(() => {
    const flat = station?.hotspots?.filter((h) => h.action === 'dialog').length ?? 0
    const sphere = station?.hotspots360?.filter((h) => h.action === 'dialog').length ?? 0
    return flat + sphere
  }, [station])

  async function createDialogBlock() {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/mpz/stations/${encodeURIComponent(slug)}/dialog`, {
          method: 'POST',
        })
        const json = (await res.json()) as { message?: string }
        if (!res.ok) {
          setError(json.message ?? `Fehler (${res.status})`)
          return
        }
        markMpzStudioDirty()
        await validateNow()
        router.refresh()
        setAddingSegment(true)
        setSuccess('Dialog angelegt — erstes Segment hinzufügen.')
      } catch {
        setError('Dialog konnte nicht angelegt werden.')
      }
    })
  }

  async function saveFiguren() {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/mpz/stations/${encodeURIComponent(slug)}/dialog`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ figuren }),
        })
        const json = (await res.json()) as { message?: string }
        if (!res.ok) {
          setError(json.message ?? `Fehler (${res.status})`)
          return
        }
        markMpzStudioDirty()
        await validateNow()
        router.refresh()
        setSuccess('Figuren gespeichert.')
      } catch {
        setError('Speichern fehlgeschlagen.')
      }
    })
  }

  async function deleteSegment(segmentId: string) {
    if (!window.confirm(`Segment „${segmentId}" wirklich löschen? WAV-Dateien werden neu nummeriert.`)) {
      return
    }
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/mpz/stations/${encodeURIComponent(slug)}/dialog/segmente/${encodeURIComponent(segmentId)}`,
          { method: 'DELETE' },
        )
        const json = (await res.json()) as { message?: string }
        if (!res.ok) {
          setError(json.message ?? `Fehler (${res.status})`)
          return
        }
        markMpzStudioDirty()
        await validateNow()
        router.refresh()
        await loadAudioStatus()
        setSuccess('Segment entfernt.')
      } catch {
        setError('Löschen fehlgeschlagen.')
      }
    })
  }

  async function deleteDialogBlock() {
    const hotspotHint =
      dialogHotspotCount > 0
        ? ` Die Station hat ${dialogHotspotCount} Dialog-Hotspot(s) — Entfernen schlägt fehl, solange diese existieren.`
        : ''
    if (
      !window.confirm(
        `Dialog für diese Station wirklich entfernen? Segmente, Gruppen und bubble-Einstellungen werden gelöscht.${hotspotHint}`,
      )
    ) {
      return
    }
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/mpz/stations/${encodeURIComponent(slug)}/dialog`, {
          method: 'DELETE',
        })
        const json = (await res.json()) as { message?: string }
        if (!res.ok) {
          setError(json.message ?? `Fehler (${res.status})`)
          return
        }
        markMpzStudioDirty()
        await validateNow()
        router.refresh()
        setSuccess('Dialog entfernt.')
      } catch {
        setError('Dialog konnte nicht entfernt werden.')
      }
    })
  }

  async function deleteGruppe(gruppeId: string) {
    if (!window.confirm(`Gruppe „${gruppeId}" wirklich löschen?`)) return
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/mpz/stations/${encodeURIComponent(slug)}/dialog/gruppen/${encodeURIComponent(gruppeId)}`,
          { method: 'DELETE' },
        )
        const json = (await res.json()) as { message?: string }
        if (!res.ok) {
          setError(json.message ?? `Fehler (${res.status})`)
          return
        }
        markMpzStudioDirty()
        await validateNow()
        router.refresh()
        setSuccess('Gruppe entfernt.')
      } catch {
        setError('Löschen fehlgeschlagen.')
      }
    })
  }

  if (!dialog) {
    return (
      <div className="flex flex-col gap-4">
        {error && <MpzFormAlert variant="error">{error}</MpzFormAlert>}
        <p className="text-sm text-fg-2">
          Maskottchen-Dialog mit Frieda und Otto für diese Station — Sprechertexte und Audio pro
          Segment im Dialog-Tab pflegen.
        </p>
        <button
          type="button"
          disabled={isPending}
          onClick={() => void createDialogBlock()}
          className="w-fit rounded-gs39-sm bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Dialog hinzufügen
        </button>
      </div>
    )
  }

  const gruppen = dialog.gruppen ?? []

  return (
    <div className="flex flex-col gap-8">
      {error && <MpzFormAlert variant="error">{error}</MpzFormAlert>}
      {success && <MpzFormAlert variant="success">{success}</MpzFormAlert>}

      {audioStatus &&
        (audioStatus.orphans.length > 0 ||
          audioStatus.driftCount > 0 ||
          audioStatus.missingCount > 0) && (
        <div className="rounded-gs39-sm border border-brand-sun/40 bg-brand-sun/10 px-4 py-3 text-sm text-fg-1">
          <p>
            {audioStatus.missingCount > 0 &&
              `${audioStatus.missingCount} fehlende WAV-Clip(s). `}
            {audioStatus.driftCount > 0 &&
              `${audioStatus.driftCount} Clip(s) mit quelle-Drift. `}
            {audioStatus.orphans.length > 0 &&
              `Verwaiste WAVs: ${audioStatus.orphans.join(', ')}.`}
          </p>
        </div>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-fg-3">
            Figuren
          </h3>
          <button
            type="button"
            disabled={isPending}
            onClick={() => void deleteDialogBlock()}
            className="rounded-gs39-sm border border-error/40 px-3 py-1.5 text-sm font-semibold text-error disabled:opacity-50"
          >
            Dialog entfernen
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {(['frieda', 'otto'] as const).map((figur) => (
            <label key={figur} className="flex items-center gap-2 text-sm text-fg-1">
              <input
                type="checkbox"
                checked={figuren.includes(figur)}
                onChange={() => toggleFigur(figur)}
              />
              {figur}
            </label>
          ))}
          <button
            type="button"
            disabled={isPending || figuren.length === 0}
            onClick={() => void saveFiguren()}
            className="rounded-gs39-sm bg-accent px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Figuren speichern
          </button>
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-fg-3">
            Segmente ({dialog.segmente.length})
          </h3>
          {!addingSegment && (
            <button
              type="button"
              onClick={() => {
                setAddingSegment(true)
                setEditingSegmentId(null)
              }}
              className="rounded-gs39-sm border border-border-1 px-3 py-1.5 text-sm font-semibold text-fg-1"
            >
              Segment hinzufügen
            </button>
          )}
        </div>

        {addingSegment && (
          <div className="mb-4">
            <StationDialogSegmentForm
              slug={slug}
              mode="add"
              gruppen={gruppen}
              onCancel={() => setAddingSegment(false)}
              onSuccess={(msg) => {
                setAddingSegment(false)
                setSuccess(msg)
                void loadAudioStatus()
              }}
            />
          </div>
        )}

        <MpzDataTable minWidth="min-w-[40rem]">
          <MpzDataTableHead>
            <th className="px-2 py-2">Nr</th>
            <th className="px-2 py-2">ID</th>
            <th className="px-2 py-2">Rolle</th>
            <th className="px-2 py-2">Text</th>
            <th className="px-2 py-2">Gruppe</th>
            <th className="px-2 py-2">Audio</th>
            <th className="px-2 py-2" />
          </MpzDataTableHead>
          <MpzDataTableBody>
              {dialog.segmente.map((seg, index) => {
                const audit = audioBySegmentId.get(seg.id)
                const audioExpanded = expandedAudioSegmentId === seg.id
                return (
                  <Fragment key={seg.id}>
                    <tr className="border-b border-border-1/60 align-top">
                      <td className="py-2 pr-2 font-mono text-fg-2">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="py-2 pr-2 font-mono text-fg-1">{seg.id}</td>
                      <td className="py-2 pr-2 capitalize text-fg-1">{seg.rolle}</td>
                      <td className="max-w-[14rem] py-2 pr-2 text-fg-2" title={seg.text}>
                        {seg.text.length > 60 ? `${seg.text.slice(0, 59)}…` : seg.text}
                      </td>
                      <td className="py-2 pr-2 text-fg-2">{seg.gruppe ?? '—'}</td>
                      <td className="py-2 pr-2">
                        {audit ? (
                          <DialogAudioStateBadge state={audit.state} />
                        ) : (
                          <span className="text-fg-3">—</span>
                        )}
                      </td>
                      <td className="py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedAudioSegmentId((prev) =>
                                prev === seg.id ? null : seg.id,
                              )
                            }
                            className={`rounded-gs39-sm border px-2 py-1 text-xs font-semibold ${
                              audioExpanded
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-border-1 text-fg-1'
                            }`}
                          >
                            Audio
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSegmentId(seg.id)
                              setAddingSegment(false)
                            }}
                            className="rounded-gs39-sm border border-border-1 px-2 py-1 text-xs font-semibold text-fg-1"
                          >
                            Bearbeiten
                          </button>
                          <button
                            type="button"
                            disabled={isPending || dialog.segmente.length <= 1}
                            onClick={() => void deleteSegment(seg.id)}
                            className="rounded-gs39-sm border border-error/40 px-2 py-1 text-xs font-semibold text-error disabled:opacity-50"
                          >
                            Löschen
                          </button>
                        </div>
                      </td>
                    </tr>
                    {audioExpanded && audit ? (
                      <tr className="border-b border-border-1/60">
                        <td colSpan={7} className="py-2">
                          <StationDialogSegmentAudioRow
                            slug={slug}
                            audit={audit}
                            disabled={isPending}
                            onMutated={loadAudioStatus}
                          />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })}
          </MpzDataTableBody>
        </MpzDataTable>

        {editingSegmentId && (
          <div className="mt-4">
            <StationDialogSegmentForm
              slug={slug}
              mode="edit"
              segment={dialog.segmente.find((s) => s.id === editingSegmentId)}
              gruppen={gruppen}
              onCancel={() => setEditingSegmentId(null)}
              onSuccess={(msg) => {
                setEditingSegmentId(null)
                setSuccess(msg)
                void loadAudioStatus()
              }}
            />
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-bold uppercase tracking-wide text-fg-3"
              onClick={() => setGruppenOpen((open) => !open)}
              aria-expanded={gruppenOpen}
            >
              <span className="text-fg-2">{gruppenOpen ? '▾' : '▸'}</span>
              Gruppen ({gruppen.length})
            </button>
            {!addingGruppe && (
              <button
                type="button"
                onClick={() => {
                  setAddingGruppe(true)
                  setEditingGruppeId(null)
                  setGruppenOpen(true)
                }}
                className="shrink-0 rounded-gs39-sm border border-border-1 px-3 py-1.5 text-sm font-semibold text-fg-1"
              >
                Gruppe hinzufügen
              </button>
            )}
          </div>
        </div>

        {gruppenOpen && (
          <>
        {addingGruppe && (
          <div className="mb-4">
            <StationDialogGruppeForm
              slug={slug}
              mode="add"
              onCancel={() => setAddingGruppe(false)}
              onSuccess={(msg) => {
                setAddingGruppe(false)
                setSuccess(msg)
              }}
            />
          </div>
        )}

        {gruppen.length === 0 && !addingGruppe ? (
          <p className="text-sm text-fg-2">Noch keine Gruppen.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {gruppen.map((g) => (
              <li
                key={g.id}
                className="rounded-gs39-sm border border-border-1 bg-bg-1 px-4 py-3"
              >
                {editingGruppeId === g.id ? (
                  <StationDialogGruppeForm
                    slug={slug}
                    mode="edit"
                    gruppeId={g.id}
                    initialText={g.text}
                    onCancel={() => setEditingGruppeId(null)}
                    onSuccess={(msg) => {
                      setEditingGruppeId(null)
                      setSuccess(msg)
                    }}
                  />
                ) : (
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm font-semibold text-fg-1">{g.id}</p>
                      <p className="mt-1 text-sm text-fg-2">{g.text}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingGruppeId(g.id)}
                        className="rounded-gs39-sm border border-border-1 px-2 py-1 text-xs font-semibold text-fg-1"
                      >
                        Bearbeiten
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => void deleteGruppe(g.id)}
                        className="rounded-gs39-sm border border-brand-red/40 px-2 py-1 text-xs font-semibold text-brand-red disabled:opacity-50"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
          </>
        )}
      </section>

      <section>
        <button
          type="button"
          className="mb-3 flex w-full items-center gap-2 text-left text-sm font-bold uppercase tracking-wide text-fg-3"
          onClick={() => setBubbleOpen((open) => !open)}
          aria-expanded={bubbleOpen}
        >
          <span className="text-fg-2">{bubbleOpen ? '▾' : '▸'}</span>
          Sprechblasen-Layout (bubble)
        </button>
        {bubbleOpen && (
        <StationDialogBubbleForm
          slug={slug}
          bubble={dialog.bubble}
          onSuccess={setSuccess}
          onError={setError}
        />
        )}
      </section>
    </div>
  )
}
