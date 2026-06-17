'use client'

import type { SaveValidateFeedback } from '@/components/mpz-studio/studio-validation-context'

type SaveValidatePanelProps = {
  feedback: SaveValidateFeedback
  onDismiss: () => void
}

export function SaveValidatePanel({ feedback, onDismiss }: SaveValidatePanelProps) {
  const isError = !feedback.ok || feedback.rolledBack

  return (
    <div
      className={`border-b px-4 py-3 md:px-6 ${
        isError
          ? 'border-brand-red/30 bg-brand-red/10'
          : 'border-brand-green/30 bg-brand-green/10'
      }`}
      role="status"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="text-sm text-fg-1">
          {feedback.rolledBack ? (
            <>
              <p className="font-semibold">Validierung fehlgeschlagen</p>
              <p className="mt-1 text-fg-2">
                Änderungen an <code className="text-xs">stations.json</code> wurden
                zurückgerollt.
              </p>
            </>
          ) : feedback.ok ? (
            <>
              <p className="font-semibold">Validierung erfolgreich</p>
              <p className="mt-1 text-fg-2">
                Struktur und referenzierte Dateien sind in Ordnung.
                {feedback.saved ? ' Hub-Reihenfolge wurde normalisiert.' : ''}
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold">Probleme gefunden</p>
              <p className="mt-1 text-fg-2">
                Es gibt noch Fehler oder Warnungen — Details im Dashboard.
              </p>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-xs font-semibold text-fg-3 underline-offset-2 hover:underline"
        >
          Schließen
        </button>
      </div>
    </div>
  )
}
