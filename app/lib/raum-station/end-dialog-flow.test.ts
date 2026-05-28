import { describe, expect, it, vi } from 'vitest'
import {
  handleStationBack,
  shouldShowDialogEndIcon,
} from '@/lib/raum-station/end-dialog-flow'

describe('shouldShowDialogEndIcon', () => {
  it('is true only for mascot dialog stations with active UI', () => {
    expect(shouldShowDialogEndIcon(true, true)).toBe(true)
    expect(shouldShowDialogEndIcon(false, true)).toBe(false)
    expect(shouldShowDialogEndIcon(true, false)).toBe(false)
  })
})

describe('handleStationBack', () => {
  it('calls endDialog before navigate when dialog is active', () => {
    const order: string[] = []
    const endDialog = vi.fn(() => order.push('end'))
    const navigate = vi.fn(() => order.push('nav'))

    handleStationBack(true, endDialog, navigate)

    expect(endDialog).toHaveBeenCalledOnce()
    expect(navigate).toHaveBeenCalledOnce()
    expect(order).toEqual(['end', 'nav'])
  })

  it('skips endDialog when dialog is inactive', () => {
    const endDialog = vi.fn()
    const navigate = vi.fn()

    handleStationBack(false, endDialog, navigate)

    expect(endDialog).not.toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledOnce()
  })
})
