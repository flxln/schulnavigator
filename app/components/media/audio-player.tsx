'use client'

import { useEffect, useRef, useState } from 'react'

export type AudioPlayerProps = {
  src: string
  label?: string
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) {
    return '0:00'
  }
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AudioPlayer({ src, label }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [error, setError] = useState(false)

  useEffect(() => {
    const el = audioRef.current
    if (!el) {
      return
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => setPlaying(false)
    const onTimeUpdate = () => setCurrentTime(el.currentTime)
    const onDurationChange = () => setDuration(el.duration)
    const onError = () => {
      setPlaying(false)
      setError(true)
    }
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('ended', onEnded)
    el.addEventListener('timeupdate', onTimeUpdate)
    el.addEventListener('durationchange', onDurationChange)
    el.addEventListener('error', onError)
    return () => {
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('timeupdate', onTimeUpdate)
      el.removeEventListener('durationchange', onDurationChange)
      el.removeEventListener('error', onError)
      // Cleanup: Wiedergabe stoppen wenn Panel geschlossen wird (analog dialog-player.tsx)
      el.pause()
    }
  }, [])

  const togglePlay = async () => {
    const el = audioRef.current
    if (!el) {
      return
    }
    setError(false)
    if (playing) {
      el.pause()
    } else {
      try {
        await el.play()
      } catch {
        setError(true)
      }
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current
    if (!el) {
      return
    }
    const t = Number(e.target.value)
    el.currentTime = t
    setCurrentTime(t)
  }

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current
    if (!el) {
      return
    }
    const v = Number(e.target.value)
    el.volume = v
    setVolume(v)
  }

  if (error) {
    return (
      <div className="sn-media-audio__error">
        <p className="text-sm text-error">Audio konnte nicht geladen werden.</p>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-accent-alt underline-offset-2 hover:underline"
        >
          Datei direkt öffnen
        </a>
      </div>
    )
  }

  return (
    <div className="sn-media-audio">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- Stationsaudio, kein UI-Untertitel nötig */}
      <audio ref={audioRef} src={src} preload="metadata" className="sr-only" />

      <div className="sn-media-audio__controls">
        <button
          type="button"
          className="sn-media-audio__play"
          onClick={() => void togglePlay()}
          aria-label={playing ? 'Pause' : `${label ?? 'Audio'} abspielen`}
        >
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <rect x="3" y="2" width="4" height="12" rx="1" />
              <rect x="9" y="2" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M4 2.5l10 5.5-10 5.5V2.5z" />
            </svg>
          )}
        </button>

        <div className="sn-media-audio__progress-wrap">
          <input
            type="range"
            className="sn-media-audio__progress"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Wiedergabeposition"
          />
          <div className="sn-media-audio__time">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <div className="sn-media-audio__volume-wrap">
        <span className="sn-media-audio__volume-label" aria-hidden>
          🔈
        </span>
        <input
          type="range"
          className="sn-media-audio__volume"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={handleVolume}
          aria-label="Lautstärke"
        />
      </div>
    </div>
  )
}
