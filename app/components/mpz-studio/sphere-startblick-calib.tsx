'use client'

import { MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { markMpzStudioDirty } from '@/components/mpz-studio/studio-validation-context'
import type { SphereCalibView } from '@/components/raum-viewer/sphere-raum-viewer-inner'
import { persistSphereStartView } from '@/lib/mpz-sphere-calib-persist'

const CALIB_VIEW_POLL_MS = 200

export type SphereStartblickCalibProps = {
  slug: string
  savedStartYaw?: number
  savedStartPitch?: number
  getCurrentView: (() => SphereCalibView | null) | null
}

export function SphereStartblickCalib({
  slug,
  savedStartYaw,
  savedStartPitch,
  getCurrentView,
}: SphereStartblickCalibProps) {
  const [view, setView] = useState<SphereCalibView | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!getCurrentView) {
      setView(null)
      return
    }
    const tick = () => {
      setView(getCurrentView())
    }
    tick()
    const id = window.setInterval(tick, CALIB_VIEW_POLL_MS)
    return () => window.clearInterval(id)
  }, [getCurrentView])

  const handleApply = useCallback(async () => {
    if (!view) {
      setError('Panorama drehen, um eine Kameraposition zu erfassen.')
      return
    }
    setBusy(true)
    setMessage(null)
    setError(null)
    try {
      const result = await persistSphereStartView({
        slug,
        startYaw: view.yawDeg,
        startPitch: view.pitchDeg,
      })
      if (!result.ok) {
        setError(result.message)
        return
      }
      markMpzStudioDirty()
      setMessage(result.message)
    } finally {
      setBusy(false)
    }
  }, [slug, view])

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 border-t border-white/10 bg-[#1a2035] p-5 md:w-80 md:border-l md:border-t-0">
      <div>
        <h2 className="text-sm font-semibold text-white">Startblick (ADR-023)</h2>
        <p className="mt-1 text-xs text-white/50">
          Drehe das Panorama, bis die gewünschte <strong>Einstiegsansicht</strong>{' '}
          unter dem <strong>Fadenkreuz</strong> in der Bildmitte liegt. Die Werte
          beziehen sich auf die Kameraposition — nicht auf einen Hotspot-Klick.
        </p>
      </div>

      {savedStartYaw !== undefined && savedStartPitch !== undefined ? (
        <p className="text-xs text-white/60">
          Gespeichert in stations.json: yaw{' '}
          <strong className="font-mono text-white">{savedStartYaw}°</strong> · pitch{' '}
          <strong className="font-mono text-white">{savedStartPitch}°</strong>
        </p>
      ) : (
        <p className="text-xs text-white/40">Noch kein Startblick in stations.json.</p>
      )}

      {view ? (
        <p className="font-mono text-sm text-white">
          yaw: <strong>{view.yawDeg}°</strong> · pitch: <strong>{view.pitchDeg}°</strong>
        </p>
      ) : (
        <p className="text-sm text-white/40">
          Panorama drehen, um die Kameraposition zu erfassen.
        </p>
      )}

      <button
        type="button"
        disabled={busy || !view}
        className="rounded-[var(--r-md)] border border-brand-green/50 bg-brand-green/20 px-4 py-2 text-sm font-semibold text-fg-on-dark disabled:opacity-40"
        onClick={() => void handleApply()}
      >
        {busy ? 'Speichern…' : 'Als Startblick übernehmen'}
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
  )
}
