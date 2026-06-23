'use client'

import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import type { SaveValidateFeedback } from '@/components/mpz-studio/studio-validation-context'

const PANEL_GUTTER =
  'border-b border-border-1 px-4 py-3 md:px-mpz-container-padding'

type SaveValidatePanelProps = {
  running?: boolean
  feedback: SaveValidateFeedback | null
  onDismiss: () => void
}

type TintBannerProps = {
  accent: 'accent' | 'error'
  role: 'alert' | 'status'
  icon: ReactNode
  title: string
  children: ReactNode
  onDismiss?: () => void
}

function TintBanner({
  accent,
  role,
  icon,
  title,
  children,
  onDismiss,
}: TintBannerProps) {
  const surface =
    accent === 'accent'
      ? 'border-l-accent bg-accent/5'
      : 'border-l-error bg-error/5'
  const titleClass = accent === 'error' ? 'text-error' : 'text-fg-1'

  return (
    <div className={PANEL_GUTTER}>
      <div
        className={`flex flex-wrap items-start justify-between gap-3 border-l-4 ${surface} px-4 py-3`}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3" role={role}>
          <span className="mt-0.5 shrink-0" aria-hidden>
            {icon}
          </span>
          <div className="min-w-0">
            <p className={`font-semibold ${titleClass}`}>{title}</p>
            <div className="mt-1 text-sm text-fg-2">{children}</div>
          </div>
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-xs font-semibold text-fg-3 underline-offset-2 hover:underline"
          >
            Schließen
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function SaveValidatePanel({
  running = false,
  feedback,
  onDismiss,
}: SaveValidatePanelProps) {
  if (running) {
    return (
      <div className={PANEL_GUTTER}>
        <div
          role="status"
          className="flex items-center gap-3 border-l-4 border-l-accent bg-accent/5 px-4 py-3"
        >
          <Loader2
            className="size-5 shrink-0 animate-spin text-accent"
            aria-hidden
          />
          <div>
            <p className="font-semibold text-fg-1">Speichern & Validieren läuft…</p>
            <p className="mt-1 text-sm text-fg-2">
              stations.json wird geschrieben und Referenzen geprüft.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!feedback) return null

  if (feedback.rolledBack) {
    return (
      <TintBanner
        accent="error"
        role="alert"
        icon={<XCircle className="size-5 text-error" />}
        title="Validierung fehlgeschlagen"
        onDismiss={onDismiss}
      >
        Änderungen an <code className="text-xs">stations.json</code> wurden
        zurückgerollt.
      </TintBanner>
    )
  }

  if (feedback.ok) {
    return (
      <TintBanner
        accent="accent"
        role="status"
        icon={<CheckCircle2 className="size-5 text-accent" />}
        title="Validierung erfolgreich"
        onDismiss={onDismiss}
      >
        Struktur und referenzierte Dateien sind in Ordnung.
        {feedback.saved ? ' Hub-Reihenfolge wurde normalisiert.' : ''}
      </TintBanner>
    )
  }

  return (
    <TintBanner
      accent="error"
      role="alert"
      icon={<AlertCircle className="size-5 text-error" />}
      title="Probleme gefunden"
      onDismiss={onDismiss}
    >
      Es gibt noch Fehler oder Warnungen — Details im Dashboard.
    </TintBanner>
  )
}
