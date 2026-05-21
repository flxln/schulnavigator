import Link from 'next/link'

export function StationBackLink() {
  return (
    <nav aria-label="Navigation">
      <Link
        href="/"
        className="inline-flex min-h-11 min-w-11 items-center text-sm font-medium text-accent-alt underline-offset-4 hover:text-fg-1 hover:underline"
      >
        Zur Startseite
      </Link>
    </nav>
  )
}
