'use client'

import type { ReactNode } from 'react'
import { TopBar } from '@/components/ui/top-bar'

type Props = {
  title: string
  onBack: () => void
  // Erwartet QrScanner + optionalen Hint-Text als separate Kinder.
  // Kein <main> hier — Landmark-Verantwortung liegt bei der jeweiligen page.tsx.
  children: ReactNode
}

export function ScanFullscreenShell({ title, onBack, children }: Props) {
  return (
    <div className="sn-fade-in relative flex min-h-[100dvh] flex-col bg-black">
      <TopBar dark title={title} onBack={onBack} tight />
      <div className="relative z-[1] flex flex-1 flex-col items-center justify-center gap-5 px-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {children}
      </div>
    </div>
  )
}
