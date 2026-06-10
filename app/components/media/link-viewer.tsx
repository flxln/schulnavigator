'use client'

import {
  externalLinkHostname,
  openExternalLink,
} from '@/lib/external-link'

export type LinkViewerProps = {
  url: string
  label?: string
}

export function LinkViewer({ url, label }: LinkViewerProps) {
  const host = externalLinkHostname(url)

  return (
    <div className="flex flex-col gap-4 rounded-[var(--r-md)] border border-border-1 bg-bg-3 p-4">
      <p className="text-sm text-fg-2">
        Sie verlassen die Schulnavigator-App. Der Link öffnet sich in einem
        neuen Browser-Tab.
      </p>
      {host ? (
        <p className="text-xs text-fg-3">
          Ziel: <span className="font-medium text-fg-2">{host}</span>
        </p>
      ) : null}
      {label ? (
        <p className="text-sm font-medium text-fg-1">{label}</p>
      ) : null}
      <button
        type="button"
        className="min-h-11 w-full rounded-[var(--r-sm)] bg-accent px-4 py-2 text-sm font-semibold text-fg-on-accent shadow-gs39-sm transition-[transform,box-shadow] hover:shadow-gs39-md active:scale-[0.98]"
        onClick={() => openExternalLink(url)}
      >
        Im Browser öffnen
      </button>
    </div>
  )
}
