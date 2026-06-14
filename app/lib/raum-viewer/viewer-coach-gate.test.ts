import { describe, expect, it } from 'vitest'
import { computeViewerBlocksCoach } from '@/lib/raum-viewer/viewer-coach-gate'

describe('computeViewerBlocksCoach', () => {
  it('blockt während checking und needs-gesture', () => {
    expect(computeViewerBlocksCoach(true, 'checking', false)).toBe(true)
    expect(computeViewerBlocksCoach(true, 'needs-gesture', false)).toBe(true)
  })

  it('blockt nicht bei terminalem unsupported', () => {
    expect(computeViewerBlocksCoach(true, 'unsupported', false)).toBe(false)
  })

  it('blockt bei aktivem Pan-Onboarding', () => {
    expect(computeViewerBlocksCoach(true, 'active', true)).toBe(true)
  })

  it('blockt nicht wenn orientation deaktiviert', () => {
    expect(computeViewerBlocksCoach(false, 'needs-gesture', false)).toBe(false)
  })

  it('gibt frei bei active ohne Pan', () => {
    expect(computeViewerBlocksCoach(true, 'active', false)).toBe(false)
  })
})
