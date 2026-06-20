'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { CoachAudioStateBadge } from '@/components/mpz-studio/coach-audio-status-badges'
import { CoachMessageForm } from '@/components/mpz-studio/coach-message-form'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import type { CoachAudioAuditEntry } from '@/lib/mpz-coach-audio-ingest'
import type { CoachMessage } from '@/lib/types'

export type CoachPanelProps = {
  messages: readonly CoachMessage[]
  stationSlugs: readonly string[]
  stationCount: number
}

interface CoachAudioStatusResponse {
  entries: CoachAudioAuditEntry[]
  orphans: string[]
}

function truncate(text: string, max = 60): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

export function CoachPanel({ messages, stationSlugs, stationCount }: CoachPanelProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [audioAudit, setAudioAudit] = useState<Map<string, CoachAudioAuditEntry>>(
    new Map(),
  )

  const loadAudioStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/mpz/coach-audio/status')
      const json = (await res.json()) as CoachAudioStatusResponse & { message?: string }
      if (!res.ok) {
        return
      }
      setAudioAudit(new Map(json.entries.map((e) => [e.messageId, e])))
    } catch {
      /* Status optional — Tabelle zeigt dann kein Badge */
    }
  }, [])

  useEffect(() => {
    void loadAudioStatus()
  }, [loadAudioStatus, messages])

  const editingMessage = editingId
    ? messages.find((m) => m.id === editingId)
    : undefined

  function handleSuccess(msg: string) {
    setSuccess(msg)
    setError(null)
    setEditingId(null)
    setAdding(false)
    void loadAudioStatus()
  }

  async function handleDelete(id: string) {
    if (!window.confirm(`Coach-Message „${id}" wirklich löschen?`)) {
      return
    }
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/mpz/coach/messages/${encodeURIComponent(id)}`, {
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
        setSuccess('Coach-Message gelöscht.')
        if (editingId === id) {
          setEditingId(null)
        }
      } catch {
        setError('Löschen fehlgeschlagen.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-fg-2">
        Fortschritts-getriggerte Maskottchen-Einblendungen (ADR-019). Datei:{' '}
        <code className="text-fg-1">content/coach-messages.json</code> — nach jedem Save
        läuft <code className="text-fg-1">validate:coach</code>.
      </p>

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

      {!adding && !editingId && (
        <button
          type="button"
          onClick={() => {
            setAdding(true)
            setSuccess(null)
            setError(null)
          }}
          className="self-start rounded-gs39-sm bg-accent px-3 py-1.5 text-sm font-semibold text-white"
        >
          Message hinzufügen
        </button>
      )}

      {adding && (
        <CoachMessageForm
          mode="add"
          stationSlugs={stationSlugs}
          stationCount={stationCount}
          onCancel={() => setAdding(false)}
          onSuccess={handleSuccess}
        />
      )}

      {editingMessage && (
        <CoachMessageForm
          mode="edit"
          message={editingMessage}
          stationSlugs={stationSlugs}
          stationCount={stationCount}
          onCancel={() => setEditingId(null)}
          onSuccess={handleSuccess}
        />
      )}

      <div className="overflow-x-auto rounded-gs39-md border border-border-1">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border-1 bg-bg-2 text-xs font-semibold uppercase tracking-wide text-fg-3">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Trigger</th>
              <th className="px-3 py-2">Details</th>
              <th className="px-3 py-2">Maskottchen</th>
              <th className="px-3 py-2">Text</th>
              <th className="px-3 py-2">Audio</th>
              <th className="px-3 py-2">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m.id} className="border-b border-border-1 last:border-b-0">
                <td className="px-3 py-2 font-mono text-xs text-fg-2">{m.id}</td>
                <td className="px-3 py-2 text-fg-1">{m.trigger}</td>
                <td className="px-3 py-2 text-xs text-fg-3">
                  {m.trigger === 'hub-milestone' && `milestone ${m.milestone}`}
                  {m.trigger === 'room-first' && `slug ${m.slug}`}
                  {m.trigger === 'hub-complete' && '—'}
                  {m.modes && (
                    <span className="ml-1 text-fg-2">[{m.modes.join(', ')}]</span>
                  )}
                </td>
                <td className="px-3 py-2 text-fg-1">
                  {m.mascot} / {m.placement}
                </td>
                <td className="max-w-[12rem] px-3 py-2 text-fg-2">{truncate(m.text)}</td>
                <td className="px-3 py-2">
                  {(() => {
                    const entry = audioAudit.get(m.id)
                    if (!m.quelle && !entry?.fileExists) {
                      return <span className="text-xs text-fg-3">—</span>
                    }
                    if (entry) {
                      return <CoachAudioStateBadge state={entry.state} />
                    }
                    return <span className="text-xs text-fg-3">—</span>
                  })()}
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isPending || editingId === m.id}
                      onClick={() => {
                        setEditingId(m.id)
                        setAdding(false)
                        setSuccess(null)
                        setError(null)
                      }}
                      className="text-xs font-semibold text-accent underline-offset-2 hover:underline disabled:opacity-50"
                    >
                      Bearbeiten
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => void handleDelete(m.id)}
                      className="text-xs font-semibold text-brand-red underline-offset-2 hover:underline disabled:opacity-50"
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
    </div>
  )
}
