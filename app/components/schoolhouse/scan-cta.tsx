import Link from 'next/link'

export function ScanCta() {
  return (
    <Link
      href="/scan"
      className="flex min-h-11 w-full items-center justify-center rounded-lg bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
    >
      QR-Code scannen
    </Link>
  )
}
