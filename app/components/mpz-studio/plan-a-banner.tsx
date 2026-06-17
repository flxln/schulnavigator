import Link from 'next/link'

export function PlanABanner() {
  return (
    <div className="border-b border-border-1 bg-bg-2 px-4 py-2 text-sm text-fg-2">
      <span className="font-semibold text-fg-1">Plan A</span> (CLI/JSON) bleibt
      Fallback. Bei Problemen:{' '}
      <Link
        href="https://github.com/flxln/schulnavigator/blob/main/anleitungen/content-einpflegen.md"
        className="font-semibold text-accent underline-offset-2 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        content-einpflegen.md
      </Link>
    </div>
  )
}
