import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MPZ Studio',
  description: 'Internes Dev-only-Ingest-Tool (ADR-022).',
  robots: { index: false, follow: false },
}

export default function MpzStudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-full bg-bg-1 text-fg-1">
      {children}
    </div>
  )
}
