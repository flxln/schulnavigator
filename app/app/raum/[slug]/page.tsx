import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllSlugs, getStationBySlug } from '@/lib/stations'

type PageProps = {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return getAllSlugs()
}

export default async function RaumPage({ params }: PageProps) {
  const { slug } = await params
  const station = getStationBySlug(slug)
  if (!station) {
    notFound()
  }

  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-4 py-8">
      <nav>
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline"
        >
          Zur Startseite
        </Link>
      </nav>
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900">
          {station.titel}
        </h1>
        <p className="mt-4 whitespace-pre-wrap text-zinc-700 leading-relaxed">
          {station.beschreibung}
        </p>
      </header>
      <p className="text-xs text-zinc-500">Slug: {station.slug}</p>
    </main>
  )
}
