'use client'

import { MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { RaumViewer } from '@/components/raum-viewer/raum-viewer'
import { markMpzStudioDirty } from '@/components/mpz-studio/studio-validation-context'
import { startPanXFromPanChange } from '@/lib/raum-viewer/viewport-center'

export type FlatStartPanCalibProps = {
  slug: string
  titel: string
  bild: string
  savedStartPanX?: number
}

export function FlatStartPanCalib({
  slug,
  titel,
  bild,
  savedStartPanX,
}: FlatStartPanCalibProps) {
  const [previewStartPanX, setPreviewStartPanX] = useState<number | null>(
    savedStartPanX ?? null,
  )
  const [displayStartPanX, setDisplayStartPanX] = useState<number | undefined>(
    savedStartPanX,
  )
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePanChange = useCallback(
    (panPx: number, effectiveDisplayW: number, containerW: number) => {
      const next = startPanXFromPanChange(panPx, effectiveDisplayW, containerW)
      setPreviewStartPanX((prev) => (prev === next ? prev : next))
    },
    [],
  )

  const persistStartPan = useCallback(async () => {
    if (previewStartPanX === null) {
      setError('Panorama wischen, um einen Startausschnitt zu erfassen.')
      return
    }
    setBusy(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch('/api/mpz/view/flat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug, startPanX: previewStartPanX }),
      })
      const json = (await res.json()) as {
        message?: string
        startPanX?: number
      }
      if (!res.ok) {
        if (res.status === 401) {
          setError('Nicht angemeldet — zuerst /mpz/unlock aufrufen.')
        } else {
          setError(json.message ?? `Fehler (${res.status})`)
        }
        return
      }
      markMpzStudioDirty()
      const saved = json.startPanX ?? previewStartPanX
      setDisplayStartPanX(saved)
      setPreviewStartPanX(saved)
      setMessage(
        `Startpan übernommen: startPanX=${saved} (Reload für Vorschau in /raum/${slug})`,
      )
    } catch {
      setError('Netzwerkfehler beim Speichern.')
    } finally {
      setBusy(false)
    }
  }, [previewStartPanX, slug])

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <div className="relative min-h-[50vh] flex-1 bg-brand-navy md:min-h-0">
        <div className="h-[calc(100svh-6.5rem)] min-h-[50vh]">
          <RaumViewer
            bild={bild}
            alt={`Raumansicht ${titel}`}
            hotspots={[]}
            medien={[]}
            startPanX={displayStartPanX}
            onPanChange={handlePanChange}
            layout="hero"
            orientationEnabled
          />
        </div>
      </div>

      <aside className="flex w-full shrink-0 flex-col gap-4 border-t border-white/10 bg-[#1a2035] p-5 md:w-80 md:border-l md:border-t-0">
        <div>
          <h2 className="text-sm font-semibold text-white">Startpan (ADR-024)</h2>
          <p className="mt-1 text-xs text-white/50">
            Wische das Panorama zur gewünschten <strong>Einstiegsansicht</strong>.
            Der Wert ist die horizontale Bildmitte (0 = linker Rand, 0,5 = Mitte).
          </p>
        </div>

        {displayStartPanX !== undefined ? (
          <p className="text-xs text-white/60">
            Gespeichert in stations.json:{' '}
            <strong className="font-mono text-white">{displayStartPanX}</strong>
          </p>
        ) : (
          <p className="text-xs text-white/40">Noch kein startPanX in stations.json.</p>
        )}

        {previewStartPanX !== null ? (
          <p className="font-mono text-sm text-white">
            Vorschau startPanX: <strong>{previewStartPanX}</strong>
          </p>
        ) : (
          <p className="text-sm text-white/40">
            Panorama wischen, um den aktuellen Ausschnitt zu erfassen.
          </p>
        )}

        <button
          type="button"
          disabled={busy || previewStartPanX === null}
          className="rounded-[var(--r-md)] border border-brand-green/50 bg-brand-green/20 px-4 py-2 text-sm font-semibold text-fg-on-dark disabled:opacity-40"
          onClick={() => void persistStartPan()}
        >
          {busy ? 'Speichern…' : 'Als Startpan übernehmen'}
        </button>

        {message ? <p className="text-sm text-brand-green">{message}</p> : null}
        {error ? (
          <MpzFormAlert variant="error">
            {error}
            {error.includes('/mpz/unlock') ? (
              <>
                {' '}
                <Link href="/mpz/unlock" className="underline">
                  Entsperren
                </Link>
              </>
            ) : null}
          </MpzFormAlert>
        ) : null}
      </aside>
    </div>
  )
}
