type HubProgressProps = {
  visited: number
  total: number
}

export function HubProgress({ visited, total }: HubProgressProps) {
  return (
    <p
      className="text-center text-sm text-zinc-600"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="font-semibold text-zinc-900">{visited}</span> von{' '}
      <span className="font-semibold text-zinc-900">{total}</span> Stationen
    </p>
  )
}
