'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import {
  MpzDataTable,
  MpzDataTableBody,
  MpzDataTableHead,
} from '@/components/mpz-studio/mpz-data-table'
import { MpzDraftNotice, MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import {
  mpzFieldClassName,
  mpzLabelClassName,
} from '@/components/mpz-studio/mpz-form-primitives'
import { useStudioValidation } from '@/components/mpz-studio/studio-validation-context'
import { LUCIDE_ICON_NAMES } from '@/lib/lucide-icon-registry'

export type AssignableSlotInfo = {
  id: string
  kind: string
  frame: readonly [number, number, number, number]
  hitFrame: readonly [number, number, number, number]
  rotation?: number
}

export type HubStationRow = {
  slug: string
  titel: string
  nr: number
  slotId: string
  accent: string
  iconName: string
}

export type HubPanelProps = {
  rows: readonly HubStationRow[]
  assignableSlots: readonly AssignableSlotInfo[]
}

function formatFrame(frame: readonly [number, number, number, number]): string {
  return frame.map((n) => n.toFixed(2)).join(', ')
}

export function HubPanel({ rows, assignableSlots }: HubPanelProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const [draft, setDraft] = useState<HubStationRow[]>(() => rows.map((r) => ({ ...r })))
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const slotById = useMemo(
    () => new Map(assignableSlots.map((slot) => [slot.id, slot])),
    [assignableSlots],
  )

  const dirty = useMemo(() => {
    return JSON.stringify(draft) !== JSON.stringify(rows)
  }, [draft, rows])

  function updateRow(slug: string, patch: Partial<HubStationRow>): void {
    setDraft((prev) => prev.map((row) => (row.slug === slug ? { ...row, ...patch } : row)))
    setError(null)
  }

  async function handleSave() {
    setError(null)
    setSuccess(null)

    const slugMap: Record<string, { slotId: string; nr: number }> = {}
    const accents: Record<string, string> = {}
    const icons: Record<string, { type: 'lucide'; name: string }> = {}

    for (const row of draft) {
      slugMap[row.slug] = { slotId: row.slotId, nr: row.nr }
      accents[row.slug] = row.accent
      icons[row.slug] = { type: 'lucide', name: row.iconName }
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/mpz/hub-config', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ slugMap, accents, icons }),
        })
        const json = (await res.json()) as { message?: string }
        if (!res.ok) {
          setError(json.message ?? 'Speichern fehlgeschlagen.')
          return
        }
        await validateNow()
        router.refresh()
        setSuccess('Hub-Konfiguration gespeichert.')
      } catch {
        setError('Netzwerkfehler beim Speichern.')
      }
    })
  }

  const sortedDraft = [...draft].sort((a, b) => a.nr - b.nr)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-fg-1">Hub-Karte</h2>
        <p className="mt-1 text-sm text-fg-3">
          Slug-Zuordnung, Akzente und Lucide-Icons für die 12 Hub-Stationen. Geometrie (
          <code className="text-fg-2">HUB_SLOTS</code>) bleibt im Code. Nach dem Speichern:
          Hub-Vorschau in der App aktualisiert sich nach <code className="text-fg-2">next dev</code>
          -Neustart.
        </p>
        <p className="mt-2 text-sm">
          <Link href="/" className="font-medium text-brand-blue underline">
            Hub-Vorschau öffnen
          </Link>
        </p>
      </div>

      {dirty && <MpzDraftNotice />}

      <MpzDataTable minWidth="min-w-[960px]">
        <MpzDataTableHead>
          <th className="px-2 py-2">Nr</th>
          <th className="px-2 py-2">Slug</th>
          <th className="px-2 py-2">Titel</th>
          <th className="px-2 py-2">Slot</th>
          <th className="px-2 py-2">Geometrie (read-only)</th>
          <th className="px-2 py-2">Akzent</th>
          <th className="px-2 py-2">Icon</th>
        </MpzDataTableHead>
        <MpzDataTableBody>
          {sortedDraft.map((row) => {
            const slot = slotById.get(row.slotId)
            return (
              <tr key={row.slug} className="border-b border-border-1/60 align-top">
                <td className="px-2 py-3">
                  <input
                    type="number"
                    min={1}
                    max={12}
                    className={`${mpzFieldClassName()} w-16`}
                    value={row.nr}
                    onChange={(e) =>
                      updateRow(row.slug, { nr: Number.parseInt(e.target.value, 10) || 1 })
                    }
                  />
                </td>
                <td className="px-2 py-3 font-mono text-xs text-fg-2">{row.slug}</td>
                <td className="px-2 py-3 text-fg-1">{row.titel}</td>
                <td className="px-2 py-3">
                  <select
                    className={mpzFieldClassName()}
                    value={row.slotId}
                    onChange={(e) => updateRow(row.slug, { slotId: e.target.value })}
                  >
                    {assignableSlots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id} ({s.kind})
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-3 font-mono text-[11px] leading-relaxed text-fg-3">
                  {slot ? (
                    <>
                      <div>frame: [{formatFrame(slot.frame)}]</div>
                      <div>hit: [{formatFrame(slot.hitFrame)}]</div>
                      {slot.rotation !== undefined && <div>rot: {slot.rotation}°</div>}
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={row.accent}
                      onChange={(e) => updateRow(row.slug, { accent: e.target.value })}
                      className="size-8 cursor-pointer rounded border border-border-1 bg-bg-1"
                      aria-label={`Akzent ${row.slug}`}
                    />
                    <input
                      type="text"
                      className={`${mpzFieldClassName()} w-24 font-mono text-xs`}
                      value={row.accent}
                      onChange={(e) => updateRow(row.slug, { accent: e.target.value })}
                    />
                  </div>
                </td>
                <td className="px-2 py-3">
                  <select
                    className={mpzFieldClassName()}
                    value={row.iconName}
                    onChange={(e) => updateRow(row.slug, { iconName: e.target.value })}
                  >
                    {LUCIDE_ICON_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            )
          })}
        </MpzDataTableBody>
      </MpzDataTable>

      {error && <MpzFormAlert variant="error">{error}</MpzFormAlert>}
      {success && <MpzFormAlert variant="success">{success}</MpzFormAlert>}

      <button
        type="button"
        disabled={!dirty || isPending}
        onClick={() => void handleSave()}
        className={`rounded-gs39-sm px-4 py-2 text-sm font-semibold transition-colors ${
          !dirty || isPending
            ? 'cursor-not-allowed border border-border-1 bg-bg-2 text-fg-3'
            : 'border border-accent bg-accent text-fg-on-dark hover:bg-accent-hover'
        }`}
      >
        {isPending ? 'Speichere…' : 'Hub-Konfiguration speichern'}
      </button>
    </div>
  )
}
