'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { parseEntryScan, parseRoomScan } from '@/lib/scan-url'

type QrScannerProps =
  | { mode: 'room'; origin: string; slugs: readonly string[] }
  | { mode: 'entry'; origin: string }

type ScannerState = 'idle' | 'starting' | 'scanning' | 'error' | 'pending'

const ENTRY_WRONG_QR =
  'Das ist ein Raum-Code. Bitte den Eintritts-QR am Eingang oder im Heft scannen. Raum-QRs funktionieren nach dem Eintritt.'
const ROOM_SCAN_ENTRY_QR =
  'Das ist der Eintritts-QR — bitte einen Raum-QR an der Tür scannen.'
const ROOM_SCAN_WRONG_QR = 'Bitte einen Raum-QR an der Tür scannen.'

export function QrScanner(props: QrScannerProps) {
  const router = useRouter()
  const regionId = useId().replace(/:/g, '')
  const containerRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null)
  const [state, setState] = useState<ScannerState>('idle')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const isEntry = props.mode === 'entry'

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
      if (props.mode === 'entry') {
        const token = parseEntryScan(decoded, props.origin)
        if (!token) {
          setStatusMessage(ENTRY_WRONG_QR)
          return
        }
        void stopScanner()
        setStatusMessage('Zugang wird geprüft …')
        setState('pending')
        window.location.replace(
          `/eintritt?t=${encodeURIComponent(token)}`,
        )
        return
      }

      const slug = parseRoomScan(decoded, props.origin, props.slugs)
      if (slug) {
        void stopScanner()
        router.push(`/raum/${slug}`)
        return
      }

      const entryToken = parseEntryScan(decoded, props.origin)
      setStatusMessage(entryToken ? ROOM_SCAN_ENTRY_QR : ROOM_SCAN_WRONG_QR)
    },
    [props, router, stopScanner],
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
        isEntry
          ? 'Kamera konnte nicht gestartet werden. Erlaube den Kamerazugriff oder scanne den Eintritts-QR mit der Kamera-App deines Geräts.'
          : 'Kamera konnte nicht gestartet werden. Erlaube den Kamerazugriff oder scanne den Raum-QR mit der Kamera-App deines Geräts.',
      )
      scannerRef.current = null
    }
  }, [isEntry, onScanSuccess, regionId, stopScanner])

  const startLabel = isEntry ? 'Eintritts-QR scannen' : 'Kamera starten'
  const tipLine = isEntry
    ? 'Tipp: Du kannst den Eintritts-QR auch mit der System-Kamera scannen — die App öffnet sich dann automatisch.'
    : 'Tipp: Du kannst Raum-QR-Codes auch mit der System-Kamera scannen — der Zugang bleibt im Browser erhalten.'

  const showCameraRegion = state !== 'pending'

  return (
    <div className="flex flex-col gap-4">
      {showCameraRegion ? (
        <div
          ref={containerRef}
          id={regionId}
          className="min-h-[240px] w-full overflow-hidden rounded-[var(--r-md)] bg-bg-dark"
          aria-hidden={state === 'idle'}
        />
      ) : null}
      {state === 'pending' ? (
        <p className="text-sm text-fg-2" role="status" aria-live="polite">
          Zugang wird geprüft …
        </p>
      ) : state === 'idle' || state === 'error' ? (
        <button
          type="button"
          onClick={() => void startScanner()}
          className="min-h-11 rounded-[var(--r-md)] bg-accent px-4 py-2 text-sm font-semibold text-fg-on-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {startLabel}
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
      {statusMessage && state !== 'pending' ? (
        <p
          className="rounded-[var(--r-md)] bg-bg-3 px-3 py-2 text-sm text-fg-1"
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </p>
      ) : null}
      {state !== 'pending' ? (
        <p className="text-xs text-fg-3">{tipLine}</p>
      ) : null}
    </div>
  )
}
