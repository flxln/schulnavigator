'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { parseRoomScan } from '@/lib/scan-url'

type QrScannerProps = {
  slugs: readonly string[]
  origin: string
}

type ScannerState = 'idle' | 'starting' | 'scanning' | 'error'

export function QrScanner({ slugs, origin }: QrScannerProps) {
  const router = useRouter()
  const regionId = useId().replace(/:/g, '')
  const containerRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null)
  const [state, setState] = useState<ScannerState>('idle')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const stopScanner = useCallback(async () => {
    const instance = scannerRef.current
    scannerRef.current = null
    if (instance) {
      try {
        await instance.stop()
      } catch {
        // Kamera bereits beendet
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      void stopScanner()
    }
  }, [stopScanner])

  const onScanSuccess = useCallback(
    (decoded: string) => {
      const slug = parseRoomScan(decoded, origin, slugs)
      if (slug) {
        void stopScanner()
        router.push(`/raum/${slug}`)
        return
      }
      setStatusMessage(
        'Dieser Code gehört nicht zum Schulnavigator. Bitte einen Raum-QR an der Tür scannen.',
      )
    },
    [origin, router, slugs, stopScanner],
  )

  const startScanner = useCallback(async () => {
    setStatusMessage(null)
    setState('starting')
    await stopScanner()

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode(regionId)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {
          // Scan-Versuch ohne Treffer — ignorieren
        },
      )
      setState('scanning')
    } catch {
      setState('error')
      setStatusMessage(
        'Kamera konnte nicht gestartet werden. Erlaube den Kamerazugriff oder scanne den Raum-QR mit der Kamera-App deines Geräts.',
      )
      scannerRef.current = null
    }
  }, [onScanSuccess, regionId, stopScanner])

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        id={regionId}
        className="min-h-[240px] w-full overflow-hidden rounded-[var(--r-md)] bg-bg-dark"
        aria-hidden={state === 'idle'}
      />
      {state === 'idle' || state === 'error' ? (
        <button
          type="button"
          onClick={() => void startScanner()}
          className="min-h-11 rounded-[var(--r-md)] bg-accent px-4 py-2 text-sm font-semibold text-fg-on-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Kamera starten
        </button>
      ) : state === 'starting' ? (
        <p className="text-sm text-fg-2" role="status" aria-live="polite">
          Kamera wird gestartet …
        </p>
      ) : (
        <button
          type="button"
          onClick={() => void stopScanner().then(() => setState('idle'))}
          className="min-h-11 rounded-[var(--r-md)] border border-border-1 bg-bg-2 px-4 py-2 text-sm font-medium text-fg-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Scanner beenden
        </button>
      )}
      {statusMessage ? (
        <p
          className="rounded-[var(--r-md)] bg-bg-3 px-3 py-2 text-sm text-fg-1"
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </p>
      ) : null}
      <p className="text-xs text-fg-3">
        Tipp: Du kannst Raum-QR-Codes auch mit der System-Kamera scannen — der
        Zugang bleibt im Browser erhalten.
      </p>
    </div>
  )
}
