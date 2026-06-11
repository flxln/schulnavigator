'use client'

import {
  DELIGHTEX_APP_STORE_URL,
  DELIGHTEX_PLAY_STORE_URL,
  getDelightexStoreUrl,
} from '@/lib/delightex-fallback'
import { openExternalLink } from '@/lib/external-link'

export type DelightexFallbackPanelProps = {
  url: string
  label?: string
  /** embed: im Kontext eines iframes; link: externer Link */
  variant: 'embed' | 'link'
}

export function DelightexFallbackPanel({
  url,
  label,
  variant,
}: DelightexFallbackPanelProps) {
  const storeUrl = getDelightexStoreUrl()

  return (
    <div className="flex flex-col gap-3 rounded-[var(--r-md)] border border-border-1 bg-bg-3 p-4">
      {label ? (
        <p className="text-sm font-medium text-fg-1">{label}</p>
      ) : null}
      <p className="text-sm text-fg-2">
        {variant === 'embed'
          ? 'Die 3D-Welt braucht WebGL oder die Delightex-App. Im eingebetteten Fenster funktioniert sie auf vielen Handys nicht.'
          : 'Diese 3D-Welt öffnet sich in einem neuen Tab. Auf dem Handy ist oft die Delightex-App nötig.'}
      </p>

      <button
        type="button"
        className="min-h-11 w-full rounded-[var(--r-sm)] bg-accent px-4 py-2 text-sm font-semibold text-fg-on-accent shadow-gs39-sm transition-[transform,box-shadow] hover:shadow-gs39-md active:scale-[0.98]"
        onClick={() => openExternalLink(url)}
      >
        Im Browser öffnen
      </button>

      {storeUrl ? (
        <button
          type="button"
          className="min-h-11 w-full rounded-[var(--r-sm)] border border-border-1 bg-bg-2 px-4 py-2 text-sm font-semibold text-fg-1 shadow-gs39-sm transition-[transform,box-shadow] hover:shadow-gs39-md active:scale-[0.98]"
          onClick={() => openExternalLink(storeUrl)}
        >
          Delightex-App installieren
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="min-h-11 w-full rounded-[var(--r-sm)] border border-border-1 bg-bg-2 px-4 py-2 text-sm font-semibold text-fg-1 shadow-gs39-sm transition-[transform,box-shadow] hover:shadow-gs39-md active:scale-[0.98]"
            onClick={() => openExternalLink(DELIGHTEX_APP_STORE_URL)}
          >
            App Store (iPhone / iPad)
          </button>
          <button
            type="button"
            className="min-h-11 w-full rounded-[var(--r-sm)] border border-border-1 bg-bg-2 px-4 py-2 text-sm font-semibold text-fg-1 shadow-gs39-sm transition-[transform,box-shadow] hover:shadow-gs39-md active:scale-[0.98]"
            onClick={() => openExternalLink(DELIGHTEX_PLAY_STORE_URL)}
          >
            Google Play (Android)
          </button>
        </div>
      )}

      <p className="text-xs text-fg-3">
        Technische Hilfe:{' '}
        <a
          href="https://www.delightex.com/edu/tech-check"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Delightex Tech-Check
        </a>
      </p>
    </div>
  )
}
