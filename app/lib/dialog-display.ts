import type { Dialog, DialogRolle, DialogSegment } from '@/lib/types'

export function dialogBubbleText(
  segment: DialogSegment,
  dialog: Dialog,
): string {
  if (segment.gruppe && dialog.gruppen) {
    const g = dialog.gruppen.find((x) => x.id === segment.gruppe)
    if (g) {
      return g.text
    }
  }
  return segment.text
}

export function dialogTailSide(rolle: DialogRolle): 'left' | 'right' | 'center' {
  if (rolle === 'frieda') {
    return 'left'
  }
  if (rolle === 'otto') {
    return 'right'
  }
  return 'center'
}

export function isMascotSpeaking(
  rolle: DialogRolle | null,
  mascot: 'frieda' | 'otto',
): boolean {
  if (!rolle) {
    return false
  }
  if (rolle === 'beide') {
    return true
  }
  return rolle === mascot
}
