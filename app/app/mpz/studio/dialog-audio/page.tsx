import Link from 'next/link'
import { DialogAudioPanel } from '@/components/mpz-studio/dialog-audio-panel'

export default function MpzStudioDialogAudioPage() {
  return (
    <main className="mx-auto flex min-h-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-fg-1">Dialog-Audio</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-sun/30 bg-brand-sun/10 px-3 py-1 text-xs font-semibold text-fg-1">
            <span className="size-1.5 rounded-full bg-brand-sun" aria-hidden />
            Nur lokal · development
          </span>
        </div>
        <p className="text-fg-2">
          WAV-Upload nach Konvention <code className="text-fg-1">NN-rolle.wav</code> (#148).
          Reihenfolge der <code className="text-fg-1">dialog.segmente[]</code> ist immutabel.
        </p>
        <Link
          href="/mpz/studio"
          className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          ← Zurück zum Studio
        </Link>
      </header>

      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <DialogAudioPanel />
      </section>
    </main>
  )
}
