import Image from 'next/image'

type FestiveDecorProps = {
  showBalloons?: boolean
  className?: string
}

export function FestiveDecor({
  showBalloons = true,
  className = '',
}: FestiveDecorProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="sn-watercolor" />
      {/* PNG-Motive folgen in public/brand/motifs/ — bis dahin nur Aquarell-CSS */}
      {showBalloons && (
        <div
          className="sn-deco-balloons absolute -right-2 top-4 h-20 w-20 rounded-full opacity-40"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, var(--brand-sun), transparent 70%)',
          }}
        />
      )}
    </div>
  )
}

/** Optional: echte Motiv-PNGs einbinden, sobald unter /brand/motifs/ vorliegen */
export function FestiveMotifImage({
  src,
  alt = '',
  width,
  height,
  className = '',
}: {
  src: string
  alt?: string
  width: number
  height: number
  className?: string
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`pointer-events-none ${className}`}
      aria-hidden={alt === ''}
    />
  )
}
