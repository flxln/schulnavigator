import type { HubUnlockMode } from '@/lib/hub-unlock-stub'

type HubDevUnlockToggleProps = {
  mode: HubUnlockMode
  onChange: (mode: HubUnlockMode) => void
}

export function HubDevUnlockToggle({
  mode,
  onChange,
}: HubDevUnlockToggleProps) {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  return (
    <div
      className="rounded-[var(--r-md)] border border-dashed border-warn/70 bg-brand-sky-50 p-3 text-xs text-fg-1"
      role="group"
      aria-label="Entwickler: Freischalt-Stub"
    >
      <p className="mb-2 font-medium">Nur Entwicklung: Schulhaus-Stub</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-[var(--r-sm)] px-3 py-2 font-medium ${
            mode === 'all-unlocked'
              ? 'bg-accent text-fg-on-dark'
              : 'bg-bg-2 text-fg-1 ring-1 ring-border-2'
          }`}
          onClick={() => onChange('all-unlocked')}
        >
          Alle offen
        </button>
        <button
          type="button"
          className={`rounded-[var(--r-sm)] px-3 py-2 font-medium ${
            mode === 'all-locked'
              ? 'bg-bg-dark text-fg-on-dark'
              : 'bg-bg-2 text-fg-1 ring-1 ring-border-2'
          }`}
          onClick={() => onChange('all-locked')}
        >
          Alle gesperrt
        </button>
      </div>
    </div>
  )
}
