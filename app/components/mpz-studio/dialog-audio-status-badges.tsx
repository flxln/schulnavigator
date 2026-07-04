import type { DialogSegmentAudit } from '@/lib/mpz-dialog-audio-ingest'

export const DIALOG_AUDIO_STATE_LABEL: Record<DialogSegmentAudit['state'], string> = {
  ok: 'ok',
  leer: 'Audio fehlt',
  drift: 'Drift',
  fehlt: 'Audio fehlt',
  'text-only': 'Nur Text',
}

export const DIALOG_AUDIO_STATE_CLASS: Record<DialogSegmentAudit['state'], string> = {
  ok: 'bg-brand-green/15 text-fg-1',
  leer: 'bg-bg-3 text-fg-2',
  drift: 'bg-brand-sun/20 text-fg-1',
  fehlt: 'bg-brand-red/15 text-fg-1',
  'text-only': 'bg-bg-3 text-fg-2',
}

export function DialogAudioStateBadge({ state }: { state: DialogSegmentAudit['state'] }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${DIALOG_AUDIO_STATE_CLASS[state]}`}
    >
      {DIALOG_AUDIO_STATE_LABEL[state]}
    </span>
  )
}
