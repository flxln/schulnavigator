type StaticRoomFallbackProps = {
  titel: string
}

export function StaticRoomFallback({ titel }: StaticRoomFallbackProps) {
  return (
    <div
      className="sn-viewer-fallback-height flex w-full flex-col items-center justify-center gap-2 rounded-[var(--r-md)] bg-gradient-to-br from-brand-sky-50 to-brand-green-300/40 px-4 text-center"
      role="img"
      aria-label={`Platzhalter: noch kein Raumfoto für ${titel}`}
    >
      <p className="text-sm font-semibold text-fg-1">Raumfoto folgt</p>
      <p className="max-w-xs text-xs text-fg-2">
        Sobald ein Foto vorliegt, erscheint hier die Raumansicht mit Hotspots.
      </p>
    </div>
  )
}
