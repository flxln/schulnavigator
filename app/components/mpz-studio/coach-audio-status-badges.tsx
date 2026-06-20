import type { CoachAudioState } from '@/lib/mpz-coach-audio-ingest'

export const COACH_AUDIO_STATE_LABEL: Record<CoachAudioState, string> = {
  ok: 'Clip ok',
  leer: 'Clip fehlt',
  drift: 'Drift',
  fehlt: 'verwaist',
}

export const COACH_AUDIO_STATE_CLASS: Record<CoachAudioState, string> = {
  ok: 'bg-brand-green/15 text-fg-1',
  leer: 'bg-bg-3 text-fg-2',
  drift: 'bg-brand-sun/20 text-fg-1',
  fehlt: 'bg-brand-red/15 text-fg-1',
}

export function CoachAudioStateBadge({ state }: { state: CoachAudioState }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${COACH_AUDIO_STATE_CLASS[state]}`}
    >
      {COACH_AUDIO_STATE_LABEL[state]}
    </span>
  )
}
