'use client'

import { useEffect } from 'react'
import { installAudioAutoplayUnlock } from '@/lib/audio-autoplay-unlock'

export function AudioAutoplayUnlock() {
  useEffect(() => installAudioAutoplayUnlock(), [])
  return null
}
