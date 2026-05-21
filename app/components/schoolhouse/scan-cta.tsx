import Link from 'next/link'

export function ScanCta() {
  return (
    <Link
      href="/scan"
      className="flex min-h-11 w-full items-center justify-center rounded-[var(--r-md)] bg-accent px-4 py-3 text-center text-sm font-semibold text-fg-on-dark shadow-gs39-sm transition-[background-color,box-shadow] duration-200 ease-out hover:bg-accent-hover hover:shadow-gs39-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      QR-Code scannen
    </Link>
  )
}
