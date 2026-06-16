import Link from 'next/link'

export default function MpzStudioPage() {
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-fg-1">MPZ Studio</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-sun/30 bg-brand-sun/10 px-3 py-1 text-xs font-semibold text-fg-1">
            <span className="size-1.5 rounded-full bg-brand-sun" aria-hidden />
            Nur lokal · development
          </span>
        </div>
        <p className="text-fg-2">
          Skeleton für Issue #145 — Stationen-Liste und Editoren folgen in #151.
        </p>
      </header>

      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-3">
          Werkzeuge
        </h2>
        <Link
          href="/mpz/studio/ingest"
          className="block text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          Medien hochladen (Test)
        </Link>
        <Link
          href="/mpz/studio/dialog-audio"
          className="mt-2 block text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          Dialog-Audio (Test)
        </Link>
      </section>

      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-3">
          Plan A (Fallback)
        </h2>
        <p className="mb-4 text-fg-2">
          Content-Pflege ohne Studio: CLI, JSON-Schema und Snippets bleiben der
          Pflicht-Pfad für den Projekttag.
        </p>
        <Link
          href="/stationen"
          className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          Zur Besucher-App (Stationen)
        </Link>
      </section>
    </main>
  )
}
