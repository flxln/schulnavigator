'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { externalLinkHostname, openExternalLink } from '@/lib/external-link'
import {
  DEFAULT_EMBED_SANDBOX,
  isEmbedEnabled,
  isEmbedUrlAllowed,
} from '@/lib/embed-allowlist'
import {
  isDelightexUrl,
  shouldSkipEmbedIframe,
} from '@/lib/delightex-fallback'
import { DelightexFallbackPanel } from '@/components/media/delightex-fallback-panel'

const LOAD_HINT_MS = 8000

export type EmbedViewerProps = {
  url: string
  allowlist: string[]
  label?: string
}

export function EmbedViewer({ url, allowlist, label }: EmbedViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loadHint, setLoadHint] = useState(false)
  const host = externalLinkHostname(url)
  const urlAllowed = isEmbedUrlAllowed(url, allowlist)
  const embedActive = isEmbedEnabled() && urlAllowed
  const isDelightex = isDelightexUrl(url)
  const skipIframe = isDelightex && shouldSkipEmbedIframe()

  useEffect(() => {
    if (!embedActive || skipIframe) {
      return
    }
    const timer = window.setTimeout(() => setLoadHint(true), LOAD_HINT_MS)
    return () => window.clearTimeout(timer)
  }, [embedActive, skipIframe, url])

  const openInBrowser = useCallback(() => {
    openExternalLink(url)
  }, [url])

  const requestFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) {
      return
    }
    void el.requestFullscreen?.()
  }, [])

  // Delightex auf Touch-Geräten: kein iframe — direkt Fallback-Karte
  if (isDelightex && skipIframe) {
    return <DelightexFallbackPanel url={url} label={label} variant="embed" />
  }

  return (
    <div className="flex flex-col gap-3">
      {!isDelightex ? (
        <>
          <p className="text-sm text-fg-2">
            Inhalt eines Drittanbieters wird in der App eingebettet.
          </p>
          {host ? (
            <p className="text-xs text-fg-3">
              Quelle: <span className="font-medium text-fg-2">{host}</span>
            </p>
          ) : null}
        </>
      ) : null}
      {label ? (
        <p className="text-sm font-medium text-fg-1">{label}</p>
      ) : null}

      {!isEmbedEnabled() ? (
        <p className="rounded-[var(--r-sm)] border border-border-1 bg-bg-3 p-3 text-sm text-fg-2">
          Einbettung ist vorübergehend deaktiviert. Nutze den Button unten, um
          die Seite im Browser zu öffnen.
        </p>
      ) : null}

      {!urlAllowed ? (
        <p className="rounded-[var(--r-sm)] border border-border-1 bg-bg-3 p-3 text-sm text-fg-2">
          Diese URL ist nicht für die Einbettung freigegeben.
        </p>
      ) : null}

      {embedActive ? (
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-[var(--r-sm)] border border-border-1 bg-bg-3"
        >
          <iframe
            title={label ?? 'Eingebetteter Inhalt'}
            src={url}
            className="aspect-video min-h-[50vh] w-full"
            loading="lazy"
            sandbox={DEFAULT_EMBED_SANDBOX}
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setLoadHint(false)}
          />
          <div className="absolute right-2 top-2 flex gap-2">
            <button
              type="button"
              className="min-h-9 rounded-[var(--r-sm)] bg-bg-2/90 px-2 text-xs font-medium text-fg-1 shadow-gs39-sm backdrop-blur"
              onClick={requestFullscreen}
            >
              Vollbild
            </button>
          </div>
        </div>
      ) : null}

      {loadHint && embedActive ? (
        <p className="text-xs text-fg-3">
          Die Einbettung lädt ungewöhnlich lange oder wurde blockiert. Du kannst
          den Inhalt im Browser öffnen.
        </p>
      ) : null}

      {/* Delightex auf Desktop: Fallback-Panel unter dem iframe (Browser-Button + Store) */}
      {isDelightex ? (
        <DelightexFallbackPanel url={url} variant="embed" />
      ) : (
        <button
          type="button"
          className="min-h-11 w-full rounded-[var(--r-sm)] bg-accent px-4 py-2 text-sm font-semibold text-fg-on-accent shadow-gs39-sm transition-[transform,box-shadow] hover:shadow-gs39-md active:scale-[0.98]"
          onClick={openInBrowser}
        >
          Im Browser öffnen
        </button>
      )}
    </div>
  )
}
