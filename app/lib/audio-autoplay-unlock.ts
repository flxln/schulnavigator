/** Minimal silent WAV — entsperrt programmatisches Audio nach User-Geste (iOS/Safari). */
const SILENT_WAV =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='

export const AUDIO_UNLOCK_EVENT = 'sn-audio-unlocked'

let unlocked = false

export function isAudioPlaybackUnlocked(): boolean {
  return unlocked
}

/** Nur aus synchronen User-Gesture-Handlern oder Capture-Listenern aufrufen. */
export function unlockAudioPlayback(): void {
  if (typeof window === 'undefined' || unlocked) {
    return
  }

  const markUnlocked = () => {
    if (unlocked) {
      return
    }
    unlocked = true
    window.dispatchEvent(new CustomEvent(AUDIO_UNLOCK_EVENT))
  }

  const audio = new Audio()
  audio.volume = 0.001
  audio.src = SILENT_WAV
  void audio.play().then(
    () => {
      audio.pause()
      markUnlocked()
    },
    () => {
      try {
        const ctx = new AudioContext()
        void ctx.resume().then(() => {
          if (ctx.state === 'running') {
            markUnlocked()
          }
          void ctx.close()
        })
      } catch {
        /* Browser ohne Web Audio */
      }
    },
  )
}

export function installAudioAutoplayUnlock(): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const onGesture = () => {
    unlockAudioPlayback()
  }

  const opts: AddEventListenerOptions = { capture: true, passive: true }
  window.addEventListener('pointerdown', onGesture, opts)
  window.addEventListener('keydown', onGesture, opts)

  return () => {
    window.removeEventListener('pointerdown', onGesture, opts)
    window.removeEventListener('keydown', onGesture, opts)
  }
}

/** Nur für Tests. */
export function resetAudioPlaybackUnlockForTests(): void {
  unlocked = false
}
