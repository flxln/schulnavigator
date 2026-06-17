'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import { findMediumHotspotReferences } from '@/lib/mpz-medium-references'
import type { Medium, Station } from '@/lib/types'

export type StationMedienTableProps = {
  slug: string
  station: Station | null
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
  return `Wird von Hotspot(s) referenziert: ${ids.join(', ')}. Zuerst in #162/JSON bereinigen.`
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

export function StationMedienTable({ slug, station }: StationMedienTableProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
    setSuccess(null)
    setRemovingId(null)
  }, [station])

  if (!station) {
    return (
      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 text-sm text-fg-2">
        <p role="alert">Station fehlt in stations.json.</p>
      </section>
    )
  }

  const stationRef = station
  const medien = stationRef.medien ?? []
  const ingestHref = `/mpz/studio/ingest?slug=${encodeURIComponent(slug)}`

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
              'Hotspot-Referenz blockiert das Entfernen — bitte zuerst in #162/JSON bereinigen.',
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
        <Link
          href={ingestHref}
          className="rounded-gs39-sm bg-accent px-3 py-2 font-semibold text-white"
        >
          Medien hinzufügen
        </Link>
      </div>

      {medien.length === 0 ? (
        <div className="rounded-gs39-md border border-dashed border-border-1 bg-bg-1 px-4 py-8 text-center">
          <p className="mb-3 font-semibold text-fg-1">Noch keine Medien</p>
          <p className="mb-4 text-fg-3">
            Füge Audio, Video, Foto oder Text für diese Station hinzu.
          </p>
          <Link
            href={ingestHref}
            className="inline-block rounded-gs39-sm bg-accent px-4 py-2 font-semibold text-white"
          >
            Erstes Medium hinzufügen
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-gs39-md border border-border-1">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border-1 bg-bg-1 text-xs font-semibold uppercase tracking-wide text-fg-3">
              <tr>
                <th className="px-3 py-2">Typ</th>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Untertitel</th>
                <th className="px-3 py-2">Quelle</th>
                <th className="px-3 py-2">
                  <span className="sr-only">Aktionen</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {medien.map((medium) => {
                const block = hotspotBlockMessage(stationRef, medium.id)
                const rowBusy = isPending || removingId === medium.id
                return (
                  <tr key={medium.id} className="border-b border-border-1 last:border-b-0">
                    <td className="px-3 py-2 text-fg-2">{medium.typ}</td>
                    <td className="px-3 py-2 font-mono text-xs text-fg-1">{medium.id}</td>
                    <td className="px-3 py-2 text-fg-2">{medium.untertitel ?? '—'}</td>
                    <td
                      className="max-w-[14rem] truncate px-3 py-2 font-mono text-xs text-fg-2"
                      title={medium.quelle}
                    >
                      {truncateQuelle(medium.quelle)}
                    </td>
                    <td className="px-3 py-2">
                      {block ? (
                        <span className="text-xs text-fg-3" title={block}>
                          Gesperrt
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={rowBusy}
                          onClick={() => handleRemove(medium)}
                          className="font-semibold text-brand-red disabled:opacity-50"
                        >
                          {rowBusy ? 'Entfernt …' : 'Entfernen'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
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
