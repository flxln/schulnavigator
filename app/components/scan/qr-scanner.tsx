'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { parseEntryScan, parseRoomScan } from '@/lib/scan-url'
import { markVisitedSlug } from '@/lib/visited-stations'

type QrScannerProps =
  | {
      mode: 'room'
      origin: string
      trustedOrigins?: readonly string[]
      slugs: readonly string[]
      chrome?: boolean
    }
  | {
      mode: 'entry'
      origin: string
      trustedOrigins?: readonly string[]
      chrome?: boolean
    }

type ScannerState = 'idle' | 'starting' | 'scanning' | 'error' | 'pending'

const ENTRY_WRONG_QR =
  'Das ist ein Raum-Code. Bitte den Eintritts-QR am Eingang oder im Heft scannen. Raum-QRs funktionieren nach dem Eintritt.'
const ROOM_SCAN_ENTRY_QR =
  'Das ist der Eintritts-QR — bitte einen Raum-QR an der Tür scannen.'
const ROOM_SCAN_WRONG_QR = 'Bitte einen Raum-QR an der Tür scannen.'
const INSECURE_CONTEXT_MESSAGE =
  'Kamera auf dem Handy braucht HTTPS. Starte den Dev-Server mit npm run dev und öffne https://<DEINE-LAN-IP>:3000 (Zertifikatswarnung bestätigen). Alternativ: QR mit der System-Kamera scannen.'

function ScanFrameOverlay({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <>
      <span className="sn-scan-corner sn-scan-corner--tl" aria-hidden />
      <span className="sn-scan-corner sn-scan-corner--tr" aria-hidden />
      <span className="sn-scan-corner sn-scan-corner--bl" aria-hidden />
      <span className="sn-scan-corner sn-scan-corner--br" aria-hidden />
      <span className="sn-scan-line" aria-hidden />
    </>
  )
}

export function QrScanner(props: QrScannerProps) {
  const router = useRouter()
  const regionId = useId().replace(/:/g, '')
  const containerRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null)
  const [state, setState] = useState<ScannerState>('idle')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const isEntry = props.mode === 'entry'
  const chrome = props.chrome === true
  const trustedOrigins = props.trustedOrigins ?? []

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
        const token = parseEntryScan(decoded, props.origin, trustedOrigins)
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

      const slug = parseRoomScan(decoded, props.origin, props.slugs, trustedOrigins)
      if (slug) {
        void stopScanner()
        markVisitedSlug(slug, new Set(props.slugs))
        router.push(`/raum/${slug}`)
        return
      }

      const entryToken = parseEntryScan(decoded, props.origin, trustedOrigins)
      setStatusMessage(entryToken ? ROOM_SCAN_ENTRY_QR : ROOM_SCAN_WRONG_QR)
    },
    [props, router, stopScanner, trustedOrigins],
  )

  const startScanner = useCallback(async () => {
    setStatusMessage(null)
    setState('starting')
    await stopScanner()

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setState('error')
      setStatusMessage(INSECURE_CONTEXT_MESSAGE)
      return
    }

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
  const showFrame = chrome && showCameraRegion

  const primaryBtnClass = chrome
    ? 'sn-btn sn-btn--scan-dark sn-btn--block'
    : 'min-h-11 rounded-[var(--r-md)] bg-accent px-4 py-2 text-sm font-semibold text-fg-on-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

  const secondaryBtnClass = chrome
    ? 'sn-btn sn-btn--outline sn-btn--block !border-white/40 !text-white hover:!bg-white/10'
    : 'min-h-11 rounded-[var(--r-md)] border border-border-1 bg-bg-2 px-4 py-2 text-sm font-medium text-fg-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

  const statusClass = chrome
    ? 'rounded-[var(--r-md)] bg-white/10 px-3 py-2 text-center text-sm text-white/90'
    : 'rounded-[var(--r-md)] bg-bg-3 px-3 py-2 text-sm text-fg-1'

  const cameraMount = showCameraRegion ? (
    <div
      ref={containerRef}
      id={regionId}
      className={
        chrome
          ? 'sn-scan-camera-mount'
          : 'aspect-square md:aspect-[4/3] min-h-[240px] w-full overflow-hidden rounded-[var(--r-md)] bg-bg-dark'
      }
      aria-hidden={state === 'idle'}
    />
  ) : null

  const framedCamera =
    showFrame && cameraMount ? (
      <div className="sn-scan-frame">
        <div className="sn-scan-camera">{cameraMount}</div>
        <ScanFrameOverlay active={state === 'scanning'} />
      </div>
    ) : (
      cameraMount
    )

  return (
    <div
      className={
        chrome ? 'sn-scan-chrome flex flex-col items-center gap-4' : 'flex flex-col gap-4'
      }
    >
      {framedCamera}

      {state === 'pending' ? (
        <p
          className={chrome ? 'text-sm text-white' : 'text-sm text-fg-2'}
          role="status"
          aria-live="polite"
        >
          Zugang wird geprüft …
        </p>
      ) : state === 'idle' || state === 'error' ? (
        <button
          type="button"
          onClick={() => void startScanner()}
          className={primaryBtnClass}
        >
          {startLabel}
        </button>
      ) : state === 'starting' ? (
        <p
          className={chrome ? 'text-sm text-white' : 'text-sm text-fg-2'}
          role="status"
          aria-live="polite"
        >
          Kamera wird gestartet …
        </p>
      ) : (
        <button
          type="button"
          onClick={() => void stopScanner().then(() => setState('idle'))}
          className={secondaryBtnClass}
        >
          Scanner beenden
        </button>
      )}

      {statusMessage && state !== 'pending' ? (
        <p className={statusClass} role="status" aria-live="polite">
          {statusMessage}
        </p>
      ) : null}

      {!chrome && state !== 'pending' ? (
        <p className="text-xs text-fg-3">{tipLine}</p>
      ) : null}
    </div>
  )
}
