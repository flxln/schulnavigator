type StaticRoomFallbackProps = {
  titel: string
}

export function StaticRoomFallback({ titel }: StaticRoomFallbackProps) {
  return (
    <div
      className="flex h-[min(42vh,280px)] w-full flex-col items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-zinc-300 to-zinc-500 px-4 text-center"
      role="img"
      aria-label={`Platzhalter: noch kein Raumfoto für ${titel}`}
    >
      <p className="text-sm font-semibold text-zinc-900">Raumfoto folgt</p>
      <p className="max-w-xs text-xs text-zinc-800">
        Sobald ein Foto vorliegt, erscheint hier die Raumansicht mit Hotspots.
      </p>
    </div>
  )
}
