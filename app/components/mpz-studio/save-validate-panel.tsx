'use client'

import type { SaveValidateFeedback } from '@/components/mpz-studio/studio-validation-context'
import { MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'

type SaveValidatePanelProps = {
  feedback: SaveValidateFeedback
  onDismiss: () => void
}

export function SaveValidatePanel({ feedback, onDismiss }: SaveValidatePanelProps) {
  return (
    <div className="border-b border-border-1 px-4 py-3 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {feedback.rolledBack ? (
          <MpzFormAlert variant="error" title="Validierung fehlgeschlagen" className="flex-1">
            Änderungen an <code className="text-xs">stations.json</code> wurden zurückgerollt.
          </MpzFormAlert>
        ) : feedback.ok ? (
          <MpzFormAlert variant="success" title="Validierung erfolgreich" className="flex-1">
            Struktur und referenzierte Dateien sind in Ordnung.
            {feedback.saved ? ' Hub-Reihenfolge wurde normalisiert.' : ''}
          </MpzFormAlert>
        ) : (
          <MpzFormAlert variant="error" title="Probleme gefunden" className="flex-1">
            Es gibt noch Fehler oder Warnungen — Details im Dashboard.
          </MpzFormAlert>
        )}
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
