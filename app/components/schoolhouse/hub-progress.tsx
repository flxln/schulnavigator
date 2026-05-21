type HubProgressProps = {
  visited: number
  total: number
}

export function HubProgress({ visited, total }: HubProgressProps) {
  return (
    <p
      className="text-center text-sm text-fg-2"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="font-semibold text-fg-1">{visited}</span> von{' '}
      <span className="font-semibold text-fg-1">{total}</span> Stationen
    </p>
  )
}
