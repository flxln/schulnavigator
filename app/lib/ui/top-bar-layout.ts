/** Mirror-Breite für TopBar rechts = linke Slot-Breite (38 + gap-2 + 38). */
export function topBarMirrorWidthClass(hasLeftExtra: boolean): 'w-[84px]' | 'w-[38px]' {
  return hasLeftExtra ? 'w-[84px]' : 'w-[38px]'
}
