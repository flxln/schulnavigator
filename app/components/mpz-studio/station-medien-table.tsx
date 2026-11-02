'use client'

import { MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import {
  MpzDataTable,
  MpzDataTableBody,
  MpzDataTableHead,
} from '@/components/mpz-studio/mpz-data-table'
import { mpzButtonClassName } from '@/components/mpz-studio/mpz-form-primitives'
import { useRouter } from 'next/navigation'
import { Fragment, useEffect, useState, useTransition } from 'react'
import { useMediaIngest } from '@/components/mpz-studio/media-ingest-modal-context'
import { StationMediumEditForm } from '@/components/mpz-studio/station-medium-edit-form'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import { findMediumHotspotReferences } from '@/lib/mpz-medium-references'
import type { Medium, Station } from '@/lib/types'

export type StationMedienTableProps = {
  slug: string
  station: Station | null
  globalSuffixes: readonly string[]
}

function truncateQuelle(quelle: string, max = 48): string {
  if (quelle.length <= max) return quelle
  return `${quelle.slice(0, max - 1)}…`
}

function isLocalMediaPath(quelle: string, slug: string): boolean {
  return quelle.startsWith(`/media/${slug}/`)
}

function hotspotBlockMessage(station: Station, mediumId: string): string | null {
  const refs = findMediumHotspotReferences(station, mediumId)
  const ids = [...refs.flat, ...refs.sphere]
  if (ids.length === 0) return null
  return `Wird von Hotspot(s) referenziert: ${ids.join(', ')}. Zuerst im Tab Hotspots entfernen.`
}

function buildConfirmMessage(medium: Medium, slug: string): string {
  const lines = [
    `Medium „${medium.id}" wirklich aus stations.json entfernen?`,
  ]
  if (isLocalMediaPath(medium.quelle, slug)) {
    lines.push(
      'Achtung: Die Datei wird endgültig vom Server gelöscht und kann nicht aus dem JSON-Backup wiederhergestellt werden.',
    )
  }
  return lines.join('\n\n')
}

function successMessage(
  slug: string,
  result: {
    fileDeleted?: boolean
    fileKeptReason?: string
  },
): string {
  const parts = ['Medium entfernt.']
  if (result.fileDeleted) {
    parts.push('Datei gelöscht.')
  } else if (result.fileKeptReason === 'still-referenced') {
    parts.push('Datei behalten — noch von anderem Medium, Hotspot oder Dialog referenziert.')
  } else if (result.fileKeptReason === 'not-local') {
    parts.push('Nur JSON-Eintrag entfernt (keine lokale /media/-Datei).')
  }
  parts.push(`Für /raum/${slug} ggf. Dev-Server neu starten (Modul-Cache).`)
  return parts.join(' ')
}

export function StationMedienTable({ slug, station, globalSuffixes }: StationMedienTableProps) {
  const router = useRouter()
  const { openMediaIngest } = useMediaIngest()
  const { validateNow } = useStudioValidation()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
    setSuccess(null)
    setRemovingId(null)
    setEditingId(null)
  }, [station])

  if (!station) {
    return (
      <MpzFormAlert variant="error">Station fehlt in stations.json.</MpzFormAlert>
    )
  }

  const stationRef = station
  const medien = stationRef.medien ?? []

  async function handleRemove(medium: Medium) {
    const block = hotspotBlockMessage(stationRef, medium.id)
    if (block) {
      setError(block)
      return
    }
    if (!window.confirm(buildConfirmMessage(medium, slug))) {
      return
    }

    setError(null)
    setSuccess(null)
    setRemovingId(medium.id)

    try {
      const res = await fetch(
        `/api/mpz/stations/${encodeURIComponent(slug)}/medien/${encodeURIComponent(medium.id)}`,
        { method: 'DELETE' },
      )
      const json = (await res.json()) as {
        message?: string
        error?: string
        fileDeleted?: boolean
        fileKeptReason?: string
      }

      if (!res.ok) {
        if (json.error === 'HOTSPOT_REFERENCE') {
          setError(
            json.message ??
              'Hotspot-Referenz blockiert das Entfernen — bitte zuerst im Tab Hotspots entfernen.',
          )
        } else {
          setError(json.message ?? `Fehler (${res.status})`)
        }
        return
      }

      setSuccess(successMessage(slug, json))
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

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-fg-2">
          {medien.length} {medien.length === 1 ? 'Eintrag' : 'Einträge'} in{' '}
          <code className="font-mono text-xs">medien[]</code>
        </p>
        <button
          type="button"
          onClick={() => openMediaIngest({ slug })}
          className={mpzButtonClassName('primary')}
        >
          Medien hinzufügen
        </button>
      </div>

      <MpzDataTable className="rounded-gs39-md border border-border-1">
        <MpzDataTableHead>
          <th className="px-3 py-2">ID</th>
          <th className="px-3 py-2">Typ</th>
          <th className="px-3 py-2">Untertitel</th>
          <th className="px-3 py-2">Quelle</th>
          <th className="px-3 py-2">
            <span className="sr-only">Aktionen</span>
          </th>
        </MpzDataTableHead>
        <MpzDataTableBody>
          {medien.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-8 text-center text-fg-3">
                Noch keine Medien. Füge Audio, Video, Foto, Text, Link oder Embed für diese
                Station hinzu.
              </td>
            </tr>
          ) : (
            medien.map((medium) => {
              const block = hotspotBlockMessage(stationRef, medium.id)
              const isEditing = editingId === medium.id
              const rowBusy = isPending || removingId === medium.id
              const activeCellClass = isEditing ? 'bg-accent/5' : ''
              const firstCellBorder = isEditing ? 'border-l-accent' : 'border-l-transparent'
              return (
                <Fragment key={medium.id}>
                  <tr className="border-b border-border-1 last:border-b-0">
                    <td
                      className={`min-h-11 border-l-4 px-3 py-2 font-mono text-xs text-fg-1 ${firstCellBorder} ${activeCellClass}`}
                    >
                      {medium.id}
                    </td>
                    <td className={`min-h-11 px-3 py-2 text-fg-2 ${activeCellClass}`}>
                      {medium.typ}
                    </td>
                    <td className={`min-h-11 px-3 py-2 text-fg-2 ${activeCellClass}`}>
                      {medium.untertitel ?? '—'}
                    </td>
                    <td
                      className={`max-w-[14rem] truncate px-3 py-2 font-mono text-xs text-fg-2 ${activeCellClass}`}
                      title={medium.quelle}
                    >
                      {truncateQuelle(medium.quelle)}
                    </td>
                    <td className={`min-h-11 px-3 py-2 ${activeCellClass}`}>
                      <div className="flex flex-wrap items-center gap-3">
                        {isEditing ? (
                          <span className="text-xs text-fg-3">Wird bearbeitet</span>
                        ) : (
                          <button
                            type="button"
                            disabled={rowBusy}
                            onClick={() => {
                              setError(null)
                              setSuccess(null)
                              setEditingId(medium.id)
                            }}
                            className="font-semibold text-accent disabled:opacity-50"
                          >
                            Bearbeiten
                          </button>
                        )}
                        {block ? (
                          <span className="text-xs text-fg-3" title={block}>
                            Gesperrt
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={rowBusy || isEditing}
                            onClick={() => handleRemove(medium)}
                            className="font-semibold text-error disabled:opacity-50"
                          >
                            {rowBusy ? 'Entfernt …' : 'Entfernen'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isEditing && (
                    <tr>
                      <td colSpan={5} className="p-0">
                        <StationMediumEditForm
                          slug={slug}
                          medium={medium}
                          globalSuffixes={globalSuffixes}
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
            })
          )}
        </MpzDataTableBody>
      </MpzDataTable>

      {error && <MpzFormAlert variant="error">{error}</MpzFormAlert>}

      {success && <MpzFormAlert variant="success">{success}</MpzFormAlert>}
    </div>
  )
}
