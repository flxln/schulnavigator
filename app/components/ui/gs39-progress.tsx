type Gs39ProgressProps = {
  visited: number
  total: number
  className?: string
}

export function Gs39Progress({
  visited,
  total,
  className = '',
}: Gs39ProgressProps) {
  const safeTotal = Math.max(1, total)
  const pct = Math.min(100, Math.round((visited / safeTotal) * 100))

  return (
    <div className={className}>
      <div className="mb-2.5 flex items-end justify-between">
        <div>
          <div className="t-eyebrow text-[11px]">Mein Rundgang</div>
          <div className="sn-brush mt-1.5 text-[32px] leading-none">
            {visited}{' '}
            <span className="text-fg-3">von {safeTotal}</span>
          </div>
        </div>
      </div>
      <div
        className="sn-progress"
        role="progressbar"
        aria-valuenow={visited}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-label={`${visited} von ${safeTotal} Stationen entdeckt`}
      >
        <div className="sn-progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
