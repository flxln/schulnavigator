'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { DialogAudioStateBadge } from '@/components/mpz-studio/dialog-audio-status-badges'
import { StationDialogBubbleForm } from '@/components/mpz-studio/station-dialog-bubble-form'
import { StationDialogGruppeForm } from '@/components/mpz-studio/station-dialog-gruppe-form'
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
      <p className="text-sm text-fg-2">Kein Dialog für diese Station.</p>
    )
  }

  const gruppen = dialog.gruppen ?? []
  const baseHref = `/mpz/studio/stationen/${encodeURIComponent(slug)}`

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <p className="rounded-gs39-sm border border-brand-red/30 bg-brand-red/10 px-3 py-2 text-sm text-fg-1">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-gs39-sm border border-brand-green/30 bg-brand-green/10 px-3 py-2 text-sm text-fg-1">
          {success}
        </p>
      )}

      {audioStatus && (audioStatus.missingCount > 0 || audioStatus.driftCount > 0) && (
        <div className="rounded-gs39-sm border border-brand-sun/40 bg-brand-sun/10 px-4 py-3 text-sm text-fg-1">
          <p>
            {audioStatus.missingCount > 0 &&
              `${audioStatus.missingCount} fehlende WAV-Clip(s). `}
            {audioStatus.driftCount > 0 &&
              `${audioStatus.driftCount} Clip(s) mit Drift. `}
            <Link
              href={`${baseHref}?tab=dialog-audio`}
              className="font-semibold text-accent underline-offset-2 hover:underline"
            >
              → Dialog-Audio-Tab
            </Link>
          </p>
        </div>
      )}

      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-fg-3">
          Figuren
        </h3>
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border-1 text-fg-3">
                <th className="py-2 pr-2 font-semibold">Nr</th>
                <th className="py-2 pr-2 font-semibold">ID</th>
                <th className="py-2 pr-2 font-semibold">Rolle</th>
                <th className="py-2 pr-2 font-semibold">Text</th>
                <th className="py-2 pr-2 font-semibold">Gruppe</th>
                <th className="py-2 pr-2 font-semibold">Audio</th>
                <th className="py-2 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {dialog.segmente.map((seg, index) => (
                <tr key={seg.id} className="border-b border-border-1/60 align-top">
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
                    {audioBySegmentId.get(seg.id) ? (
                      <DialogAudioStateBadge state={audioBySegmentId.get(seg.id)!.state} />
                    ) : (
                      <span className="text-fg-3">—</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex justify-end gap-1">
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
                        className="rounded-gs39-sm border border-brand-red/40 px-2 py-1 text-xs font-semibold text-brand-red disabled:opacity-50"
                      >
                        Löschen
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
          <h3 className="text-sm font-bold uppercase tracking-wide text-fg-3">
            Gruppen ({gruppen.length})
          </h3>
          {!addingGruppe && (
            <button
              type="button"
              onClick={() => {
                setAddingGruppe(true)
                setEditingGruppeId(null)
              }}
              className="rounded-gs39-sm border border-border-1 px-3 py-1.5 text-sm font-semibold text-fg-1"
            >
              Gruppe hinzufügen
            </button>
          )}
        </div>

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
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-fg-3">
          Sprechblasen-Layout (bubble)
        </h3>
        <StationDialogBubbleForm
          slug={slug}
          bubble={dialog.bubble}
          onSuccess={setSuccess}
          onError={setError}
        />
      </section>
    </div>
  )
}
