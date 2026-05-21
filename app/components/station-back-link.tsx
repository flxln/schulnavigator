import Link from 'next/link'

export function StationBackLink() {
  return (
    <nav aria-label="Navigation">
      <Link
        href="/"
        className="inline-flex min-h-11 min-w-11 items-center text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline"
      >
        Zur Startseite
      </Link>
    </nav>
  )
}
