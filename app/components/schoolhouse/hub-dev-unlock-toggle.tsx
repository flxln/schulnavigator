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
      className="rounded-lg border border-dashed border-amber-400 bg-amber-50 p-3 text-xs text-amber-950"
      role="group"
      aria-label="Entwickler: Freischalt-Stub"
    >
      <p className="mb-2 font-medium">Nur Entwicklung: Schulhaus-Stub</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-md px-3 py-2 font-medium ${
            mode === 'all-unlocked'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-zinc-800 ring-1 ring-zinc-300'
          }`}
          onClick={() => onChange('all-unlocked')}
        >
          Alle offen
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-2 font-medium ${
            mode === 'all-locked'
              ? 'bg-zinc-700 text-white'
              : 'bg-white text-zinc-800 ring-1 ring-zinc-300'
          }`}
          onClick={() => onChange('all-locked')}
        >
          Alle gesperrt
        </button>
      </div>
    </div>
  )
}
