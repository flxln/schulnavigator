import { DialogAudioPanel } from '@/components/mpz-studio/dialog-audio-panel'

export default function MpzStudioDialogAudioPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-6 text-sm text-fg-2">
        WAV-Upload nach Konvention <code className="text-fg-1">NN-rolle.wav</code>{' '}
        (#148). Reihenfolge der{' '}
        <code className="text-fg-1">dialog.segmente[]</code> ist immutabel.
      </p>
      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <DialogAudioPanel />
      </section>
    </div>
  )
}
